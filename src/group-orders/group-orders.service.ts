import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGroupOrderDto,
  GroupOrderStatusValue,
} from './dto/create-group-order.dto';
import { UpdateGroupOrderDto } from './dto/update-group-order.dto';

@Injectable()
export class GroupOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createGroupOrder(
    params: CreateGroupOrderDto & {
      tenantId: string;
      actorUserId: string;
    },
  ) {
    await this.assertCoordinatorBelongsToTenant({
      tenantId: params.tenantId,
      coordinatorCustomerId: params.coordinatorCustomerId,
    });

    const groupOrderNumber =
      params.groupOrderNumber?.trim() ||
      (await this.generateGroupOrderNumber(params.tenantId));

    const groupOrder = await this.prisma.groupOrder.create({
      data: {
        tenantId: params.tenantId,
        groupOrderNumber,
        title: this.clean(params.title),
        coordinatorCustomerId: params.coordinatorCustomerId || undefined,
        hospitalName: this.clean(params.hospitalName),
        town: this.clean(params.town),
        contactName: this.clean(params.contactName),
        contactPhone: this.clean(params.contactPhone),
        deliveryAddress: this.clean(params.deliveryAddress),
        deliveryTown: this.clean(params.deliveryTown),
        status: params.status ?? 'DRAFT',
        expectedDeliveryDate: params.expectedDeliveryDate
          ? new Date(params.expectedDeliveryDate)
          : undefined,
        notes: this.clean(params.notes),
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
      },
      include: this.listInclude(),
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'group_order',
      entityId: groupOrder.id,
      metadata: {
        groupOrderNumber: groupOrder.groupOrderNumber,
        title: groupOrder.title,
        coordinatorCustomerId: groupOrder.coordinatorCustomerId,
      },
    });

    return groupOrder;
  }

  async updateGroupOrder(
    params: UpdateGroupOrderDto & {
      id: string;
      tenantId: string;
      actorUserId: string;
    },
  ) {
    const existing = await this.prisma.groupOrder.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Group order not found');
    }

    await this.assertCoordinatorBelongsToTenant({
      tenantId: params.tenantId,
      coordinatorCustomerId: params.coordinatorCustomerId,
    });

    const groupOrder = await this.prisma.groupOrder.update({
      where: {
        id: params.id,
      },
      data: {
        groupOrderNumber: this.clean(params.groupOrderNumber),
        title: this.clean(params.title),
        coordinatorCustomerId:
          params.coordinatorCustomerId === ''
            ? null
            : params.coordinatorCustomerId,
        hospitalName: this.clean(params.hospitalName),
        town: this.clean(params.town),
        contactName: this.clean(params.contactName),
        contactPhone: this.clean(params.contactPhone),
        deliveryAddress: this.clean(params.deliveryAddress),
        deliveryTown: this.clean(params.deliveryTown),
        status: params.status,
        expectedDeliveryDate: params.expectedDeliveryDate
          ? new Date(params.expectedDeliveryDate)
          : undefined,
        notes: this.clean(params.notes),
        updatedById: params.actorUserId,
      },
      include: this.listInclude(),
    });

    await this.recalculateGroupOrderTotals({
      tenantId: params.tenantId,
      groupOrderId: params.id,
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'group_order',
      entityId: groupOrder.id,
      metadata: {
        groupOrderNumber: groupOrder.groupOrderNumber,
        oldStatus: existing.status,
        newStatus: groupOrder.status,
      },
    });

    return this.getGroupOrderById({
      id: groupOrder.id,
      tenantId: params.tenantId,
    });
  }

  async listGroupOrders(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: GroupOrderStatusValue;
    coordinatorCustomerId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.GroupOrderWhereInput = {
      tenantId: params.tenantId,
      status: params.status,
      coordinatorCustomerId: params.coordinatorCustomerId || undefined,
      createdAt:
        params.fromDate || params.toDate
          ? {
              gte: params.fromDate ? new Date(params.fromDate) : undefined,
              lte: params.toDate ? new Date(params.toDate) : undefined,
            }
          : undefined,
      OR: search
        ? [
            { groupOrderNumber: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { hospitalName: { contains: search, mode: 'insensitive' } },
            { town: { contains: search, mode: 'insensitive' } },
            { contactName: { contains: search, mode: 'insensitive' } },
            { contactPhone: { contains: search, mode: 'insensitive' } },
            { deliveryTown: { contains: search, mode: 'insensitive' } },
            {
              coordinatorCustomer: {
                fullName: { contains: search, mode: 'insensitive' },
              },
            },
            {
              coordinatorCustomer: {
                phoneNumber: { contains: search, mode: 'insensitive' },
              },
            },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.groupOrder.findMany({
        where,
        include: this.listInclude(),
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.groupOrder.count({ where }),
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

  async lookupGroupOrders(params: {
    tenantId: string;
    search?: string;
    limit?: number;
  }) {
    const search = params.search?.trim();
    const take = Math.min(params.limit ?? 10, 50);

    return this.prisma.groupOrder.findMany({
      where: {
        tenantId: params.tenantId,
        status: {
          in: ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY'],
        },
        OR: search
          ? [
              { groupOrderNumber: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { hospitalName: { contains: search, mode: 'insensitive' } },
              { contactName: { contains: search, mode: 'insensitive' } },
              { contactPhone: { contains: search, mode: 'insensitive' } },
              {
                coordinatorCustomer: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                coordinatorCustomer: {
                  phoneNumber: { contains: search, mode: 'insensitive' },
                },
              },
            ]
          : undefined,
      },
      select: {
        id: true,
        groupOrderNumber: true,
        title: true,
        hospitalName: true,
        town: true,
        contactName: true,
        contactPhone: true,
        deliveryTown: true,
        status: true,
        totalOrders: true,
        totalQty: true,
        totalAmount: true,
        balanceAmount: true,
        coordinatorCustomer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            town: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
    });
  }

  async getGroupOrderById(params: { id: string; tenantId: string }) {
    const groupOrder = await this.prisma.groupOrder.findFirst({
  where: {
    id: params.id,
    tenantId: params.tenantId,
  },
  select: {
    id: true,
    groupOrderNumber: true,
    title: true,
    hospitalName: true,
    town: true,
    contactName: true,
    contactPhone: true,
    deliveryAddress: true,
    deliveryTown: true,
    status: true,
    totalOrders: true,
    totalQty: true,
    totalAmount: true,
    advanceAmount: true,
    balanceAmount: true,
    expectedDeliveryDate: true,
    notes: true,

    coordinatorCustomer: {
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        town: true,
      },
    },

    orders: {
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalQty: true,
        totalAmount: true,
        advanceAmount: true,
        balanceAmount: true,
        orderDate: true,
        promisedDate: true,

        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            town: true,
          },
        },

        items: {
          select: {
            id: true,
            itemDescription: true,
            quantity: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },

    _count: {
      select: {
        orders: true,
        payments: true,
      },
    },
  },
});
    if (!groupOrder) {
      throw new NotFoundException('Group order not found');
    }

    return groupOrder;
  }

  async deleteGroupOrder(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.groupOrder.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        _count: {
          select: {
            orders: true,
            payments: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Group order not found');
    }

    if (existing._count.orders > 0 || existing._count.payments > 0) {
      throw new BadRequestException(
        'Cannot delete a group order that already has orders or payments.',
      );
    }

    await this.prisma.groupOrder.delete({
      where: {
        id: params.id,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'group_order',
      entityId: params.id,
      metadata: {
        groupOrderNumber: existing.groupOrderNumber,
        title: existing.title,
      },
    });
  }

  async markDelivered(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
    notes?: string;
  }) {
    const existing = await this.prisma.groupOrder.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Group order not found');
    }

    const groupOrder = await this.prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          tenantId: params.tenantId,
          groupOrderId: params.id,
          status: {
            not: 'CANCELLED',
          },
        },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          updatedById: params.actorUserId,
        },
      });

      return tx.groupOrder.update({
        where: {
          id: params.id,
        },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          notes: params.notes ?? existing.notes,
          updatedById: params.actorUserId,
        },
        include: this.listInclude(),
      });
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'group_order',
      entityId: params.id,
      metadata: {
        operation: 'mark_delivered',
        groupOrderNumber: groupOrder.groupOrderNumber,
      },
    });

    return groupOrder;
  }

  async recalculateGroupOrderTotals(params: {
    tenantId: string;
    groupOrderId: string;
  }) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId: params.tenantId,
        groupOrderId: params.groupOrderId,
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        totalQty: true,
        totalAmount: true,
        advanceAmount: true,
        balanceAmount: true,
        courierCharges: true,
      },
    });

    const totals = orders.reduce(
      (acc, order) => {
        acc.totalQty += Number(order.totalQty ?? 0);
        acc.totalAmount += Number(order.totalAmount ?? 0);
        acc.advanceAmount += Number(order.advanceAmount ?? 0);
        acc.balanceAmount += Number(order.balanceAmount ?? 0);
        acc.courierCharges += Number(order.courierCharges ?? 0);
        return acc;
      },
      {
        totalQty: 0,
        totalAmount: 0,
        advanceAmount: 0,
        balanceAmount: 0,
        courierCharges: 0,
      },
    );

    return this.prisma.groupOrder.update({
      where: {
        id: params.groupOrderId,
      },
      data: {
        totalOrders: orders.length,
        totalQty: totals.totalQty,
        totalAmount: totals.totalAmount,
        advanceAmount: totals.advanceAmount,
        balanceAmount: totals.balanceAmount,
        courierCharges: totals.courierCharges,
      },
    });
  }

  private async assertCoordinatorBelongsToTenant(params: {
    tenantId: string;
    coordinatorCustomerId?: string;
  }) {
    if (!params.coordinatorCustomerId) return;

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: params.coordinatorCustomerId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Coordinator customer not found');
    }
  }

  private async generateGroupOrderNumber(tenantId: string) {
    const count = await this.prisma.groupOrder.count({
      where: {
        tenantId,
      },
    });

    return `GRP-${String(count + 1).padStart(5, '0')}`;
  }

  private listInclude() {
    return {
      coordinatorCustomer: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          town: true,
          hospitalName: true,
        },
      },
      _count: {
        select: {
          orders: true,
          payments: true,
        },
      },
    } satisfies Prisma.GroupOrderInclude;
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }
}
