import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { GroupOrdersService } from "../group-orders/group-orders.service";

type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "CUTTING"
  | "SEWING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

type OrderSourceValue =
  | "DREZAURA"
  | "PHYSICAL_SHOP"
  | "PHONE_CALL"
  | "WHATSAPP"
  | "ONLINE";

type OrderTypeValue = "INDIVIDUAL" | "GROUP_MEMBER";

type PaymentStatusValue =
  | "UNPAID"
  | "ADVANCE_PAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED";

type OrderPaymentModeValue =
  | "CASH"
  | "ONLINE_TRANSFER"
  | "BANK_DEPOSIT"
  | "CARD"
  | "MIXED";

type OrderItemStatusValue =
  | "PENDING"
  | "CUTTING"
  | "SEWING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

type OrderItemInput = {
  id?: string;
  categoryId: string;
  blockId?: string | null;
  measurementId?: string | null;
  itemDescription?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  notes?: string | null;
  tailorNote?: string | null;
  status?: OrderItemStatusValue;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly groupOrdersService: GroupOrdersService,
  ) {}

  async createOrder(params: {
    tenantId: string;
    customerId: string;
    groupOrderId?: string | null;
    orderNumber: string;
    orderDate?: string;
    promisedDate?: string;
    status?: OrderStatusValue;
    orderSource?: OrderSourceValue;
    paymentStatus?: PaymentStatusValue;
    paymentMode?: OrderPaymentModeValue;
    hospitalName?: string;
    town?: string;
    customerAddress?: string;
    totalQty?: number;
    totalAmount?: number;
    advanceAmount?: number;
    balanceAmount?: number;
    courierCharges?: number;
    notes?: string;
    specialNotes?: string;
    items: OrderItemInput[];
    actorUserId: string;
  }) {
    if (!params.items?.length) {
      throw new BadRequestException("At least one order item is required.");
    }

    await this.validateCustomer({
      tenantId: params.tenantId,
      customerId: params.customerId,
    });

    if (params.groupOrderId) {
      await this.validateGroupOrder({
        tenantId: params.tenantId,
        groupOrderId: params.groupOrderId,
      });
    }

    await this.validateOrderItems({
      tenantId: params.tenantId,
      items: params.items,
    });

    const calculatedTotalQty =
      params.totalQty ??
      params.items.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0);

    const calculatedTotalAmount =
      params.totalAmount ??
      params.items.reduce((sum, item) => {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? 0);
        const lineTotal = item.lineTotal ?? quantity * unitPrice;

        return sum + Number(lineTotal);
      }, 0);

    const advanceAmount = Number(params.advanceAmount ?? 0);
    const courierCharges = Number(params.courierCharges ?? 0);
    const balanceAmount =
      params.balanceAmount ?? Math.max(calculatedTotalAmount + courierCharges - advanceAmount, 0);

    const order = await this.prisma.order.create({
  data: {
    tenantId: params.tenantId,
    customerId: params.customerId,
    groupOrderId: params.groupOrderId || undefined,
    orderType: params.groupOrderId ? 'GROUP_MEMBER' : 'INDIVIDUAL',
    orderNumber: params.orderNumber.trim(),

    orderDate: params.orderDate ? new Date(params.orderDate) : new Date(),
    promisedDate: params.promisedDate ? new Date(params.promisedDate) : undefined,
   
    status: params.status ?? 'PENDING',
    orderSource: params.orderSource ?? 'PHYSICAL_SHOP',
    paymentStatus:
      params.paymentStatus ??
      this.resolvePaymentStatus(advanceAmount, balanceAmount),
    paymentMode: params.paymentMode || undefined,

    hospitalName: this.clean(params.hospitalName),
    town: this.clean(params.town),
    customerAddress: this.clean(params.customerAddress),

    totalQty: calculatedTotalQty,
    totalAmount: calculatedTotalAmount,
    advanceAmount,
    balanceAmount,
    courierCharges,

    notes: this.clean(params.notes),
    specialNotes: this.clean(params.specialNotes),

    createdById: params.actorUserId,
    updatedById: params.actorUserId,

    items: {
      create: params.items.map((item) => {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? 0);

        return {
          categoryId: item.categoryId,
          blockId: item.blockId || undefined,
          measurementId: item.measurementId || undefined,
          itemDescription: this.clean(item.itemDescription) ?? 'Tailoring item',
          quantity,
          unitPrice,
          lineTotal: item.lineTotal ?? quantity * unitPrice,
          notes: item.notes === null ? null : this.clean(item.notes),
          tailorNote:
            item.tailorNote === null ? null : this.clean(item.tailorNote),
          status: item.status ?? 'PENDING',
        };
      }),
    },
  },
});

    if (params.groupOrderId) {
      await this.groupOrdersService.recalculateGroupOrderTotals({
        tenantId: params.tenantId,
        groupOrderId: params.groupOrderId,
      });
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: "order",
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        orderSource: order.orderSource,
        orderType: order.orderType,
        groupOrderId: order.groupOrderId,
        itemCount: params.items.length,
      },
    });

    return this.getOrderById({
      id: order.id,
      tenantId: params.tenantId,
    });
  }

  async updateOrder(params: {
    id: string;
    tenantId: string;
    customerId?: string;
    groupOrderId?: string | null;
    orderNumber?: string;
    orderDate?: string;
    promisedDate?: string | null;
    completedAt?: string | null;
    deliveredAt?: string | null;
    status?: OrderStatusValue;
    orderSource?: OrderSourceValue;
    paymentStatus?: PaymentStatusValue;
    paymentMode?: OrderPaymentModeValue | null;
    hospitalName?: string | null;
    town?: string | null;
    customerAddress?: string | null;
    totalQty?: number;
    totalAmount?: number;
    advanceAmount?: number;
    balanceAmount?: number;
    courierCharges?: number;
    notes?: string | null;
    specialNotes?: string | null;
    items?: OrderItemInput[];
    actorUserId: string;
  }) {
    const existing = await this.prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        items: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Order not found.");
    }

    if (params.customerId) {
      await this.validateCustomer({
        tenantId: params.tenantId,
        customerId: params.customerId,
      });
    }

    if (params.groupOrderId) {
      await this.validateGroupOrder({
        tenantId: params.tenantId,
        groupOrderId: params.groupOrderId,
      });
    }

    if (params.items) {
      if (!params.items.length) {
        throw new BadRequestException("At least one order item is required.");
      }

      await this.validateOrderItems({
        tenantId: params.tenantId,
        items: params.items,
      });
    }

    const nextGroupOrderId =
      params.groupOrderId === undefined
        ? existing.groupOrderId
        : params.groupOrderId || null;

    const calculatedTotalQty =
      params.totalQty ??
      (params.items
        ? params.items.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0)
        : undefined);

    const calculatedTotalAmount =
      params.totalAmount ??
      (params.items
        ? params.items.reduce((sum, item) => {
            const quantity = Number(item.quantity ?? 1);
            const unitPrice = Number(item.unitPrice ?? 0);
            const lineTotal = item.lineTotal ?? quantity * unitPrice;

            return sum + Number(lineTotal);
          }, 0)
        : undefined);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: {
          id: params.id,
        },
        data: {
          customerId: params.customerId,
          groupOrderId:
            params.groupOrderId === undefined ? undefined : nextGroupOrderId,
          orderType:
            params.groupOrderId === undefined
              ? undefined
              : ((nextGroupOrderId ? "GROUP_MEMBER" : "INDIVIDUAL") as any),
          orderNumber: params.orderNumber?.trim(),
          orderDate: params.orderDate ? new Date(params.orderDate) : undefined,
          promisedDate:
            params.promisedDate === undefined
              ? undefined
              : params.promisedDate
                ? new Date(params.promisedDate)
                : null,
          completedAt:
            params.completedAt === undefined
              ? undefined
              : params.completedAt
                ? new Date(params.completedAt)
                : null,
          deliveredAt:
            params.deliveredAt === undefined
              ? undefined
              : params.deliveredAt
                ? new Date(params.deliveredAt)
                : null,
          status: params.status as any,
          orderSource: params.orderSource as any,
          paymentStatus: params.paymentStatus as any,
          paymentMode:
            params.paymentMode === undefined ? undefined : (params.paymentMode as any),
          hospitalName:
            params.hospitalName === undefined
              ? undefined
              : this.clean(params.hospitalName),
          town:
            params.town === undefined ? undefined : this.clean(params.town),
          customerAddress:
            params.customerAddress === undefined
              ? undefined
              : this.clean(params.customerAddress),
          totalQty: calculatedTotalQty,
          totalAmount: calculatedTotalAmount,
          advanceAmount: params.advanceAmount,
          balanceAmount: params.balanceAmount,
          courierCharges: params.courierCharges,
          notes:
            params.notes === undefined ? undefined : this.clean(params.notes),
          specialNotes:
            params.specialNotes === undefined
              ? undefined
              : this.clean(params.specialNotes),
          updatedById: params.actorUserId,
        },
      });

      if (params.items) {
        await tx.orderItem.deleteMany({
          where: {
            orderId: params.id,
          },
        });

        await tx.orderItem.createMany({
          data: params.items.map((item) => {
            const quantity = Number(item.quantity ?? 1);
            const unitPrice = Number(item.unitPrice ?? 0);

            return {
              orderId: params.id,
              categoryId: item.categoryId,
              blockId: item.blockId || null,
              measurementId: item.measurementId || null,
              itemDescription:
                this.clean(item.itemDescription) ?? "Tailoring item",
              quantity,
              unitPrice,
              lineTotal: item.lineTotal ?? quantity * unitPrice,
              notes: item.notes ?? null,
              tailorNote: item.tailorNote ?? null,
              status: (item.status ?? "PENDING") as any,
            };
          }),
        });
      }
    });

    const groupOrderIdsToRecalculate = [
      existing.groupOrderId,
      nextGroupOrderId,
    ].filter(Boolean) as string[];

    for (const groupOrderId of [...new Set(groupOrderIdsToRecalculate)]) {
      await this.groupOrdersService.recalculateGroupOrderTotals({
        tenantId: params.tenantId,
        groupOrderId,
      });
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: "order",
      entityId: params.id,
      metadata: {
        oldOrderNumber: existing.orderNumber,
        orderNumber: params.orderNumber ?? existing.orderNumber,
        groupOrderId: nextGroupOrderId,
      },
    });

    return this.getOrderById({
      id: params.id,
      tenantId: params.tenantId,
    });
  }

  async deleteOrder(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        _count: {
          select: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException("Order not found.");
    }

    if (existing._count.payments > 0) {
      throw new BadRequestException(
        "Cannot delete this order because it already has payments.",
      );
    }

    await this.prisma.order.delete({
      where: {
        id: params.id,
      },
    });

    if (existing.groupOrderId) {
      await this.groupOrdersService.recalculateGroupOrderTotals({
        tenantId: params.tenantId,
        groupOrderId: existing.groupOrderId,
      });
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: "order",
      entityId: params.id,
      metadata: {
        orderNumber: existing.orderNumber,
        itemCount: existing._count.items,
        groupOrderId: existing.groupOrderId,
      },
    });

    return {
      success: true,
    };
  }

  async listOrders(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: OrderStatusValue;
    orderSource?: OrderSourceValue;
    paymentStatus?: PaymentStatusValue;
    orderDate?: string;
    promisedDate?: string;
    customerId?: string;
    groupOrderId?: string;
    groupOrdersOnly?: boolean;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.OrderWhereInput = {
      tenantId: params.tenantId,
      status: params.status as any,
      orderSource: params.orderSource as any,
      paymentStatus: params.paymentStatus as any,
      customerId: params.customerId || undefined,
      groupOrderId: params.groupOrderId || undefined,
      OR: search
        ? [
            {
              orderNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              customer: {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              customer: {
                phoneNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              groupOrder: {
                groupOrderNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              groupOrder: {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              groupOrder: {
                hospitalName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ]
        : undefined,
    };

    if (params.groupOrdersOnly) {
      where.groupOrderId = {
        not: null,
      };
    }

    if (params.orderDate) {
      const start = new Date(params.orderDate);
      const end = new Date(params.orderDate);
      end.setDate(end.getDate() + 1);

      where.orderDate = {
        gte: start,
        lt: end,
      };
    }

    if (params.promisedDate) {
      const start = new Date(params.promisedDate);
      const end = new Date(params.promisedDate);
      end.setDate(end.getDate() + 1);

      where.promisedDate = {
        gte: start,
        lt: end,
      };
    }

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
        include: this.listInclude(),
      }),
      this.prisma.order.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrderById(params: { id: string; tenantId: string }) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: this.detailInclude(),
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return order;
  }

  private async validateCustomer(params: {
    tenantId: string;
    customerId: string;
  }) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: params.customerId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }
  }

  private async validateGroupOrder(params: {
    tenantId: string;
    groupOrderId: string;
  }) {
    const groupOrder = await this.prisma.groupOrder.findFirst({
      where: {
        id: params.groupOrderId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!groupOrder) {
      throw new NotFoundException("Group order not found.");
    }
  }

  private async validateOrderItems(params: {
    tenantId: string;
    items: OrderItemInput[];
  }) {
    const categoryIds = [
      ...new Set(params.items.map((item) => item.categoryId).filter(Boolean)),
    ];

    const blockIds = [
      ...new Set(
        params.items
          .map((item) => item.blockId)
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const measurementIds = [
      ...new Set(
        params.items
          .map((item) => item.measurementId)
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const validCategoryCount = await this.prisma.category.count({
      where: {
        tenantId: params.tenantId,
        id: {
          in: categoryIds,
        },
      },
    });

    if (validCategoryCount !== categoryIds.length) {
      throw new NotFoundException("One or more categories were not found.");
    }

    if (blockIds.length) {
      const validBlockCount = await this.prisma.block.count({
        where: {
          tenantId: params.tenantId,
          id: {
            in: blockIds,
          },
        },
      });

      if (validBlockCount !== blockIds.length) {
        throw new NotFoundException("One or more blocks were not found.");
      }
    }

    if (measurementIds.length) {
      const validMeasurementCount = await this.prisma.measurement.count({
        where: {
          tenantId: params.tenantId,
          id: {
            in: measurementIds,
          },
        },
      });

      if (validMeasurementCount !== measurementIds.length) {
        throw new NotFoundException(
          "One or more measurements were not found.",
        );
      }
    }
  }

  private resolvePaymentStatus(
    advanceAmount: number,
    balanceAmount: number,
  ): PaymentStatusValue {
    if (advanceAmount <= 0) {
      return "UNPAID";
    }

    if (balanceAmount <= 0) {
      return "PAID";
    }

    return "ADVANCE_PAID";
  }

  private listInclude() {
    return {
      customer: true,
      groupOrder: {
        select: {
          id: true,
          groupOrderNumber: true,
          title: true,
          hospitalName: true,
          town: true,
          contactName: true,
          contactPhone: true,
          status: true,
          totalOrders: true,
          totalQty: true,
          totalAmount: true,
          advanceAmount: true,
          balanceAmount: true,
          coordinatorCustomer: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              town: true,
              hospitalName: true,
            },
          },
        },
      },
      items: {
        include: {
          category: true,
          block: {
            include: {
              category: true,
            },
          },
          measurement: {
            include: {
              values: {
                include: {
                  field: true,
                },
              },
            },
          },
        },
      },
      payments: true,
      _count: {
        select: {
          items: true,
          payments: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private detailInclude() {
    return {
      customer: true,
      groupOrder: {
        include: {
          coordinatorCustomer: true,
          orders: {
            include: {
              customer: true,
              items: {
                include: {
                  category: true,
                },
              },
              payments: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          payments: {
            orderBy: {
              paymentDate: "desc",
            },
          },
        },
      },
      payments: {
        orderBy: {
          paymentDate: "desc",
        },
      },
      items: {
        include: {
          category: true,
          block: {
            include: {
              category: true,
              customerBlocks: {
                include: {
                  customer: true,
                },
                orderBy: [{ isDefault: "desc" }, { assignedAt: "asc" }],
              },
            },
          },
          measurement: {
            include: {
              values: {
                include: {
                  field: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          items: true,
          payments: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }
}