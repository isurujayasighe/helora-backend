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

export type OrderItemInput = {
  id?: string;
  categoryId: string;
  blockId?: string | null;
  measurementId?: string | null;

  itemDescription?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  lineTotal?: number | null;

  notes?: string | null;
  tailorNote?: string | null;
  status?: OrderItemStatusValue | null;

  /**
   * Used when measurementId is not available yet.
   *
   * Example:
   * {
   *   shoulder: "14.5",
   *   chest: "34",
   *   waist: "39"
   * }
   *
   * Keys must match MeasurementField.code for the selected category.
   */
  measurements?: Record<string, string | number | null | undefined>;

  measurementNote?: string | null;
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
    orderNumber?: string;
    orderDate?: string;
    promisedDate?: string;
    completedAt?: string;
    deliveredAt?: string;
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
      customerId: params.customerId,
      items: params.items,
    });

    const calculatedTotalQty =
      params.totalQty ??
      params.items.reduce((sum, item) => {
        return sum + Number(item.quantity ?? 1);
      }, 0);

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
      params.balanceAmount ??
      Math.max(calculatedTotalAmount + courierCharges - advanceAmount, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const orderNumber =
        this.clean(params.orderNumber) ??
        (await this.generateOrderNumber(tx, params.tenantId));

      const createdOrder = await tx.order.create({
        data: {
          tenantId: params.tenantId,
          customerId: params.customerId,
          groupOrderId: params.groupOrderId || undefined,
          orderType: params.groupOrderId ? "GROUP_MEMBER" : "INDIVIDUAL",

          orderNumber,

          orderDate: params.orderDate ? new Date(params.orderDate) : new Date(),
          promisedDate: params.promisedDate
            ? new Date(params.promisedDate)
            : undefined,
          completedAt: params.completedAt
            ? new Date(params.completedAt)
            : undefined,
          deliveredAt: params.deliveredAt
            ? new Date(params.deliveredAt)
            : undefined,

          status: params.status ?? "PENDING",
          orderSource: params.orderSource ?? "PHYSICAL_SHOP",

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
        },
      });

      for (const item of params.items) {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? 0);
        const lineTotal = Number(item.lineTotal ?? quantity * unitPrice);

        const finalMeasurementId = await this.resolveMeasurementIdForOrderItem(
          tx,
          {
            tenantId: params.tenantId,
            customerId: params.customerId,
            actorUserId: params.actorUserId,
            item,
          },
        );

        await tx.orderItem.create({
          data: {
            tenantId: params.tenantId,
            orderId: createdOrder.id,

            categoryId: item.categoryId,
            blockId: item.blockId || undefined,
            measurementId: finalMeasurementId || undefined,

            itemDescription:
              this.clean(item.itemDescription) ?? "Tailoring item",

            quantity,
            unitPrice,
            lineTotal,

            notes: item.notes === null ? null : this.clean(item.notes),
            tailorNote:
              item.tailorNote === null ? null : this.clean(item.tailorNote),

            status: item.status ?? "PENDING",

            createdById: params.actorUserId,
            updatedById: params.actorUserId,
          },
        });
      }

      return createdOrder;
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



  async getOrders(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: OrderStatusValue;
    orderDate?: string;
    promisedDate?: string;
    customerId?: string;
    groupOrderId?: string;
  }) {
    const page = Math.max(Number(params.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(params.pageSize ?? 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = {
      tenantId: params.tenantId,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.groupOrderId) {
      where.groupOrderId = params.groupOrderId;
    }

    if (params.orderDate) {
      const start = this.startOfDay(params.orderDate);
      const end = this.endOfDay(params.orderDate);

      where.orderDate = {
        gte: start,
        lte: end,
      };
    }

    if (params.promisedDate) {
      const start = this.startOfDay(params.promisedDate);
      const end = this.endOfDay(params.promisedDate);

      where.promisedDate = {
        gte: start,
        lte: end,
      };
    }

    const cleanedSearch = this.clean(params.search);

    if (cleanedSearch) {
      where.OR = [
        {
          orderNumber: {
            contains: cleanedSearch,
            mode: "insensitive",
          },
        },
        {
          hospitalName: {
            contains: cleanedSearch,
            mode: "insensitive",
          },
        },
        {
          town: {
            contains: cleanedSearch,
            mode: "insensitive",
          },
        },
        {
          customer: {
            fullName: {
              contains: cleanedSearch,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            phoneNumber: {
              contains: cleanedSearch,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: this.orderInclude(),
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({
        where,
      }),
    ]);

    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

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
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return order;
  }

  async updateOrderStatus(params: {
    tenantId: string;
    id: string;
    status: OrderStatusValue;
    actorUserId: string;
  }) {
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException("Order not found.");
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        status: params.status,
        completedAt:
          params.status === "READY" || params.status === "DELIVERED"
            ? existingOrder.completedAt ?? new Date()
            : existingOrder.completedAt,
        deliveredAt:
          params.status === "DELIVERED"
            ? existingOrder.deliveredAt ?? new Date()
            : existingOrder.deliveredAt,
        updatedById: params.actorUserId,
      },
    });

    if (existingOrder.groupOrderId) {
      await this.groupOrdersService.recalculateGroupOrderTotals({
        tenantId: params.tenantId,
        groupOrderId: existingOrder.groupOrderId,
      });
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: "order",
      entityId: updatedOrder.id,
      metadata: {
        orderNumber: updatedOrder.orderNumber,
        previousStatus: existingOrder.status,
        nextStatus: updatedOrder.status,
      },
    });

    return this.getOrderById({
      id: updatedOrder.id,
      tenantId: params.tenantId,
    });
  }

  async updateOrder(params: {
  id: string;
  tenantId: string;
  actorUserId: string;

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
  paymentMode?: OrderPaymentModeValue;

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
}) {
  const existingOrder = await this.prisma.order.findFirst({
    where: {
      id: params.id,
      tenantId: params.tenantId,
    },
    include: {
      items: true,
    },
  });

  if (!existingOrder) {
    throw new NotFoundException('Order not found.');
  }

  const nextCustomerId = params.customerId ?? existingOrder.customerId;
  const nextGroupOrderId =
    params.groupOrderId === undefined
      ? existingOrder.groupOrderId
      : params.groupOrderId;

  await this.validateCustomer({
    tenantId: params.tenantId,
    customerId: nextCustomerId,
  });

  if (nextGroupOrderId) {
    await this.validateGroupOrder({
      tenantId: params.tenantId,
      groupOrderId: nextGroupOrderId,
    });
  }

  if (params.items?.length) {
    await this.validateOrderItems({
      tenantId: params.tenantId,
      customerId: nextCustomerId,
      items: params.items,
    });
  }

  const sourceItems = params.items?.length ? params.items : existingOrder.items;

  const calculatedTotalQty =
    params.totalQty ??
    sourceItems.reduce((sum, item) => {
      return sum + Number(item.quantity ?? 1);
    }, 0);

  const calculatedTotalAmount =
    params.totalAmount ??
    sourceItems.reduce((sum, item) => {
      const quantity = Number(item.quantity ?? 1);
      const unitPrice = Number(item.unitPrice ?? 0);
      const lineTotal = item.lineTotal ?? quantity * unitPrice;

      return sum + Number(lineTotal);
    }, 0);

  const advanceAmount = Number(
    params.advanceAmount ?? existingOrder.advanceAmount ?? 0,
  );

  const courierCharges = Number(
    params.courierCharges ?? existingOrder.courierCharges ?? 0,
  );

  const balanceAmount =
    params.balanceAmount ??
    Math.max(calculatedTotalAmount + courierCharges - advanceAmount, 0);

  const updatedOrder = await this.prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        customerId: nextCustomerId,
        groupOrderId: nextGroupOrderId || undefined,
        orderType: nextGroupOrderId ? 'GROUP_MEMBER' : 'INDIVIDUAL',

        orderNumber:
          params.orderNumber !== undefined
            ? this.clean(params.orderNumber) ?? existingOrder.orderNumber
            : existingOrder.orderNumber,

        orderDate:
          params.orderDate !== undefined
            ? new Date(params.orderDate)
            : existingOrder.orderDate,

        promisedDate:
          params.promisedDate !== undefined
            ? params.promisedDate
              ? new Date(params.promisedDate)
              : null
            : existingOrder.promisedDate,

        completedAt:
          params.completedAt !== undefined
            ? params.completedAt
              ? new Date(params.completedAt)
              : null
            : existingOrder.completedAt,

        deliveredAt:
          params.deliveredAt !== undefined
            ? params.deliveredAt
              ? new Date(params.deliveredAt)
              : null
            : existingOrder.deliveredAt,

        status: params.status ?? existingOrder.status,
        orderSource: params.orderSource ?? existingOrder.orderSource,

        paymentStatus:
          params.paymentStatus ??
          this.resolvePaymentStatus(advanceAmount, balanceAmount),

        paymentMode:
          params.paymentMode !== undefined
            ? params.paymentMode || undefined
            : existingOrder.paymentMode,

        hospitalName:
          params.hospitalName !== undefined
            ? this.clean(params.hospitalName)
            : existingOrder.hospitalName,

        town:
          params.town !== undefined
            ? this.clean(params.town)
            : existingOrder.town,

        customerAddress:
          params.customerAddress !== undefined
            ? this.clean(params.customerAddress)
            : existingOrder.customerAddress,

        totalQty: calculatedTotalQty,
        totalAmount: calculatedTotalAmount,
        advanceAmount,
        balanceAmount,
        courierCharges,

        notes:
          params.notes !== undefined
            ? params.notes === null
              ? null
              : this.clean(params.notes)
            : existingOrder.notes,

        specialNotes:
          params.specialNotes !== undefined
            ? params.specialNotes === null
              ? null
              : this.clean(params.specialNotes)
            : existingOrder.specialNotes,

        updatedById: params.actorUserId,
      },
    });

    if (params.items) {
      await tx.orderItem.deleteMany({
        where: {
          tenantId: params.tenantId,
          orderId: existingOrder.id,
        },
      });

      for (const item of params.items) {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Number(item.unitPrice ?? 0);
        const lineTotal = Number(item.lineTotal ?? quantity * unitPrice);

        const finalMeasurementId = await this.resolveMeasurementIdForOrderItem(
          tx,
          {
            tenantId: params.tenantId,
            customerId: nextCustomerId,
            actorUserId: params.actorUserId,
            item,
          },
        );

        await tx.orderItem.create({
          data: {
            tenantId: params.tenantId,
            orderId: existingOrder.id,

            categoryId: item.categoryId,
            blockId: item.blockId || undefined,
            measurementId: finalMeasurementId || undefined,

            itemDescription:
              this.clean(item.itemDescription) ?? 'Tailoring item',

            quantity,
            unitPrice,
            lineTotal,

            notes: item.notes === null ? null : this.clean(item.notes),
            tailorNote:
              item.tailorNote === null ? null : this.clean(item.tailorNote),

            status: item.status ?? 'PENDING',

            createdById: params.actorUserId,
            updatedById: params.actorUserId,
          },
        });
      }
    }

    return order;
  });

  const affectedGroupOrderIds = new Set<string>();

  if (existingOrder.groupOrderId) {
    affectedGroupOrderIds.add(existingOrder.groupOrderId);
  }

  if (updatedOrder.groupOrderId) {
    affectedGroupOrderIds.add(updatedOrder.groupOrderId);
  }

  for (const groupOrderId of affectedGroupOrderIds) {
    await this.groupOrdersService.recalculateGroupOrderTotals({
      tenantId: params.tenantId,
      groupOrderId,
    });
  }

  await this.auditService.log({
    tenantId: params.tenantId,
    actorUserId: params.actorUserId,
    action: AuditAction.UPDATE,
    entityType: 'order',
    entityId: updatedOrder.id,
    metadata: {
      orderNumber: updatedOrder.orderNumber,
      previousStatus: existingOrder.status,
      nextStatus: updatedOrder.status,
      previousGroupOrderId: existingOrder.groupOrderId,
      nextGroupOrderId: updatedOrder.groupOrderId,
      itemCount: params.items?.length ?? existingOrder.items.length,
    },
  });

  return this.getOrderById({
    id: updatedOrder.id,
    tenantId: params.tenantId,
  });
}

  async deleteOrder(params: {
    tenantId: string;
    id: string;
    actorUserId: string;
  }) {
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException("Order not found.");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          tenantId: params.tenantId,
          orderId: existingOrder.id,
        },
      });

      await tx.order.delete({
        where: {
          id: existingOrder.id,
        },
      });
    });

    if (existingOrder.groupOrderId) {
      await this.groupOrdersService.recalculateGroupOrderTotals({
        tenantId: params.tenantId,
        groupOrderId: existingOrder.groupOrderId,
      });
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: "order",
      entityId: existingOrder.id,
      metadata: {
        orderNumber: existingOrder.orderNumber,
        itemCount: existingOrder.items.length,
      },
    });

    return {
      success: true,
      message: "Order deleted successfully.",
    };
  }

  private async resolveMeasurementIdForOrderItem(
    tx: Prisma.TransactionClient,
    params: {
      tenantId: string;
      customerId: string;
      actorUserId: string;
      item: OrderItemInput;
    },
  ) {
    const { tenantId, customerId, actorUserId, item } = params;

    if (item.measurementId) {
      const existingMeasurement = await tx.measurement.findFirst({
        where: {
          id: item.measurementId,
          tenantId,
          customerId,
          categoryId: item.categoryId,
          isActive: true,
          ...(item.blockId ? { blockId: item.blockId } : {}),
        },
      });

      if (!existingMeasurement) {
        throw new BadRequestException(
          `Invalid measurementId for item: ${
            this.clean(item.itemDescription) ?? item.categoryId
          }.`,
        );
      }

      return existingMeasurement.id;
    }

    const hasMeasurementValues =
      item.measurements &&
      Object.values(item.measurements).some(
        (value) => value !== undefined && value !== null && value !== "",
      );

    if (!hasMeasurementValues) {
      return null;
    }

    const category = await tx.category.findFirst({
      where: {
        id: item.categoryId,
        tenantId,
        isActive: true,
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Invalid categoryId for item: ${
          this.clean(item.itemDescription) ?? item.categoryId
        }.`,
      );
    }

    if (item.blockId) {
      const block = await tx.block.findFirst({
        where: {
          id: item.blockId,
          tenantId,
          categoryId: item.categoryId,
        },
      });

      if (!block) {
        throw new BadRequestException(
          `Invalid blockId for item: ${
            this.clean(item.itemDescription) ?? item.blockId
          }.`,
        );
      }
    }

    const measurementFields = await tx.measurementField.findMany({
      where: {
        tenantId,
        categoryId: item.categoryId,
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    if (!measurementFields.length) {
      throw new BadRequestException(
        `No measurement fields configured for category "${category.name}".`,
      );
    }

    const fieldsByCode = new Map(
      measurementFields.map((field) => [field.code, field]),
    );

    const valuesToCreate = Object.entries(item.measurements ?? {})
      .map(([fieldCode, rawValue]) => {
        const field = fieldsByCode.get(fieldCode);

        if (!field) {
          throw new BadRequestException(
            `Invalid measurement field code "${fieldCode}" for category "${category.name}".`,
          );
        }

        const value =
          rawValue === undefined || rawValue === null
            ? null
            : String(rawValue).trim();

        if (!value) return null;

        return {
          field,
          value,
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          field: (typeof measurementFields)[number];
          value: string;
        } => Boolean(entry),
      );

    if (!valuesToCreate.length) {
      return null;
    }

    const previousLatestMeasurement = await tx.measurement.findFirst({
      where: {
        tenantId,
        customerId,
        categoryId: item.categoryId,
        blockId: item.blockId || null,
        isActive: true,
      },
      orderBy: [{ versionNo: "desc" }, { createdAt: "desc" }],
    });

    if (previousLatestMeasurement) {
      await tx.measurement.update({
        where: {
          id: previousLatestMeasurement.id,
        },
        data: {
          isActive: false,
          updatedById: actorUserId,
        },
      });
    }

    const measurementNumber = await this.generateMeasurementNumber(
      tx,
      tenantId,
    );

    const newMeasurement = await tx.measurement.create({
      data: {
        tenantId,
        customerId,
        blockId: item.blockId || null,
        categoryId: item.categoryId,

        measurementNumber,
        verificationStatus: "NOT_VERIFIED",
        verificationNote:
          item.measurementNote || "Measurement created while placing order.",

        isActive: true,
        versionNo: previousLatestMeasurement
          ? previousLatestMeasurement.versionNo + 1
          : 1,

        previousMeasurementId: previousLatestMeasurement?.id || null,
        notes: item.measurementNote || null,

        createdById: actorUserId,
        updatedById: actorUserId,
      },
    });

    await tx.measurementValue.createMany({
      data: valuesToCreate.map(({ field, value }) => ({
        tenantId,
        measurementId: newMeasurement.id,
        fieldId: field.id,
        value,
        numericValue: this.getNumericValue(value, field.inputType),
        note: null,
        createdById: actorUserId,
        updatedById: actorUserId,
      })),
    });

    return newMeasurement.id;
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
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
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
    });

    if (!groupOrder) {
      throw new NotFoundException("Group order not found.");
    }

    return groupOrder;
  }

  private async validateOrderItems(params: {
    tenantId: string;
    customerId: string;
    items: OrderItemInput[];
  }) {
    for (const item of params.items) {
      if (!item.categoryId) {
        throw new BadRequestException("Category is required for order item.");
      }

      const category = await this.prisma.category.findFirst({
        where: {
          id: item.categoryId,
          tenantId: params.tenantId,
          isActive: true,
        },
      });

      if (!category) {
        throw new BadRequestException(`Invalid categoryId: ${item.categoryId}.`);
      }

      if (item.blockId) {
        const block = await this.prisma.block.findFirst({
          where: {
            id: item.blockId,
            tenantId: params.tenantId,
            categoryId: item.categoryId,
          },
        });

        if (!block) {
          throw new BadRequestException(`Invalid blockId: ${item.blockId}.`);
        }
      }

      if (item.measurementId) {
        const measurement = await this.prisma.measurement.findFirst({
          where: {
            id: item.measurementId,
            tenantId: params.tenantId,
            customerId: params.customerId,
            categoryId: item.categoryId,
            isActive: true,
            ...(item.blockId ? { blockId: item.blockId } : {}),
          },
        });

        if (!measurement) {
          throw new BadRequestException(
            `Invalid measurementId: ${item.measurementId}.`,
          );
        }
      }

      const hasMeasurementValues =
        item.measurements &&
        Object.values(item.measurements).some(
          (value) => value !== undefined && value !== null && value !== "",
        );

      if (!item.measurementId && hasMeasurementValues) {
        const fieldCodes = Object.keys(item.measurements ?? {});

        const validFieldCount = await this.prisma.measurementField.count({
          where: {
            tenantId: params.tenantId,
            categoryId: item.categoryId,
            code: {
              in: fieldCodes,
            },
            isActive: true,
          },
        });

        if (validFieldCount !== fieldCodes.length) {
          throw new BadRequestException(
            `One or more measurement field codes are invalid for category "${category.name}".`,
          );
        }
      }
    }
  }

  private orderInclude() {
    return {
      customer: true,
      groupOrder: true,
      items: {
        include: {
          category: true,
          block: true,
          measurement: {
            include: {
              values: {
                include: {
                  field: true,
                },
                orderBy: {
                  field: {
                    sortOrder: "asc" as const,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc" as const,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private resolvePaymentStatus(
    advanceAmount: number,
    balanceAmount: number,
  ): PaymentStatusValue {
    if (balanceAmount <= 0) return "PAID";
    if (advanceAmount > 0 && balanceAmount > 0) return "ADVANCE_PAID";
    return "UNPAID";
  }

  private getNumericValue(value: string | null, inputType?: string | null) {
    if (!value) return null;

    const isNumericInput =
      inputType === "DECIMAL" ||
      inputType === "NUMBER" ||
      inputType === "INTEGER";

    if (!isNumericInput) return null;

    const parsed = Number(value);

    if (Number.isNaN(parsed)) return null;

    return new Prisma.Decimal(parsed);
  }

  private async generateOrderNumber(
    tx: Prisma.TransactionClient,
    tenantId: string,
  ) {
    const count = await tx.order.count({
      where: {
        tenantId,
      },
    });

    return `ORD-${String(count + 1).padStart(5, "0")}`;
  }

  private async generateMeasurementNumber(
    tx: Prisma.TransactionClient,
    tenantId: string,
  ) {
    const count = await tx.measurement.count({
      where: {
        tenantId,
      },
    });

    return `MSR-${String(count + 1).padStart(5, "0")}`;
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }

  private startOfDay(value: string) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private endOfDay(value: string) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
  }
}