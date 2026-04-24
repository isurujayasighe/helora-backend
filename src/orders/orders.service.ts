import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createOrder(params: {
    tenantId: string;
    customerId: string;
    orderNumber: string;
    orderDate?: string;
    promisedDate?: string;
    status?: string;
    notes?: string;
    totalAmount?: number;
    advanceAmount?: number;
    balanceAmount?: number;
    items: Array<{
      categoryId: string;
      blockId?: string;
      itemDescription?: string;
      quantity: number;
      unitPrice?: number;
      lineTotal?: number;
      notes?: string;
    }>;
    actorUserId: string;
  }) {
    const order = await this.prisma.order.create({
      data: {
        tenantId: params.tenantId,
        customerId: params.customerId,
        orderNumber: params.orderNumber,
        orderDate: params.orderDate ? new Date(params.orderDate) : new Date(),
        promisedDate: params.promisedDate
          ? new Date(params.promisedDate)
          : undefined,
        status: params.status ?? "PENDING",
        notes: params.notes,
        totalAmount: params.totalAmount,
        advanceAmount: params.advanceAmount,
        balanceAmount: params.balanceAmount,
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
        items: {
          create: params.items.map((item) => ({
            categoryId: item.categoryId,
            blockId: item.blockId,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            notes: item.notes,
          })),
        },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: "order",
      entityId: order.id,
      metadata: {
        orderNumber: params.orderNumber,
        itemCount: params.items.length,
      },
    });

    return this.getOrderById({ id: order.id, tenantId: params.tenantId });
  }

  async updateOrder(params: {
    id: string;
    tenantId: string;
    customerId?: string;
    orderNumber?: string;
    orderDate?: string;
    promisedDate?: string;
    status?: string;
    notes?: string | null;
    totalAmount?: number;
    advanceAmount?: number;
    balanceAmount?: number;
    items?: Array<{
      id?: string;
      categoryId?: string;
      blockId?: string;
      itemDescription?: string;
      quantity?: number;
      unitPrice?: number;
      lineTotal?: number;
      notes?: string;
    }>;
    actorUserId: string;
  }) {
    const existing = await this.prisma.order.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundException("Order not found");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: params.id },
        data: {
          customerId: params.customerId,
          orderNumber: params.orderNumber,
          orderDate: params.orderDate ? new Date(params.orderDate) : undefined,
          promisedDate: params.promisedDate
            ? new Date(params.promisedDate)
            : params.promisedDate === null
              ? null
              : undefined,
          status: params.status,
          notes: params.notes,
          totalAmount: params.totalAmount,
          advanceAmount: params.advanceAmount,
          balanceAmount: params.balanceAmount,
          updatedById: params.actorUserId,
        },
      });

      if (params.items) {
        await tx.orderItem.deleteMany({ where: { orderId: params.id } });
        if (params.items.length > 0) {
          await tx.orderItem.createMany({
            data: params.items.map((item) => ({
              orderId: params.id,
              categoryId: item.categoryId!,
              blockId: item.blockId,
              itemDescription: item.itemDescription,
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              notes: item.notes,
            })),
          });
        }
      }
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: "order",
      entityId: params.id,
      metadata: { orderNumber: params.orderNumber ?? existing.orderNumber },
    });

    return this.getOrderById({ id: params.id, tenantId: params.tenantId });
  }

  async deleteOrder(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.order.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: { _count: { select: { items: true } } },
    });

    if (!existing) {
      throw new NotFoundException("Order not found");
    }

    await this.prisma.order.delete({ where: { id: params.id } });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: "order",
      entityId: params.id,
      metadata: {
        orderNumber: existing.orderNumber,
        itemCount: existing._count.items,
      },
    });
  }

  async listOrders(params: {
    tenantId: string;
    search?: string;
    status?: string;
    orderDate?: string;
    promisedDate?: string;
    customerId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.OrderWhereInput = {
      tenantId: params.tenantId,
    };

    if (params.status) {
      where.status = params.status as any;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.search) {
      where.OR = [
        {
          orderNumber: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            fullName: {
              contains: params.search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            phoneNumber: {
              contains: params.search,
              mode: "insensitive",
            },
          },
        },
      ];
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

    const [items, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ orderDate: "desc" }, { createdAt: "desc" }],
        include: {
          customer: true,
          items: {
            include: {
              category: true,
              block: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
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
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        customer: true,
        items: {
          include: {
            category: true,
            block: {
              include: {
                customer: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }
}
