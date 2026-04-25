import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createCustomer(params: {
    tenantId: string;
    fullName: string;
    phoneNumber?: string;
    alternatePhone?: string;
    town?: string;
    address?: string;
    notes?: string;
    actorUserId: string;
  }) {
    const customer = await this.prisma.customer.create({
      data: {
        tenantId: params.tenantId,
        fullName: params.fullName,
        phoneNumber: params.phoneNumber,
        alternatePhone: params.alternatePhone,
        town: params.town,
        address: params.address,
        notes: params.notes,
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
      },
      include: {
        _count: {
          select: {
            customerBlocks: true,
            orders: true,
          },
        },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'customer',
      entityId: customer.id,
      metadata: {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
      },
    });

    return customer;
  }

  async updateCustomer(params: {
    id: string;
    tenantId: string;
    fullName?: string;
    phoneNumber?: string;
    alternatePhone?: string;
    town?: string;
    address?: string;
    notes?: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.customer.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.prisma.customer.update({
      where: { id: params.id },
      data: {
        fullName: params.fullName,
        phoneNumber: params.phoneNumber,
        alternatePhone: params.alternatePhone,
        town: params.town,
        address: params.address,
        notes: params.notes,
        updatedById: params.actorUserId,
      },
      include: {
        _count: {
          select: {
            customerBlocks: true,
            orders: true,
          },
        },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'customer',
      entityId: customer.id,
      metadata: {
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
      },
    });

    return customer;
  }

  async deleteCustomer(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.customer.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        _count: {
          select: {
            customerBlocks: true,
            orders: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({
      where: { id: params.id },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'customer',
      entityId: params.id,
      metadata: {
        blockCount: existing._count.customerBlocks,
        orderCount: existing._count.orders,
      },
    });
  }

  async listCustomers(params: {
    tenantId: string;
    search?: string;
    town?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = {
      tenantId: params.tenantId,
      town: params.town || undefined,
      OR: params.search
        ? [
            { fullName: { contains: params.search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: params.search, mode: 'insensitive' as const } },
            {
              alternatePhone: {
                contains: params.search,
                mode: 'insensitive' as const,
              },
            },
            { town: { contains: params.search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              customerBlocks: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.customer.count({ where }),
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

  async getCustomerById(params: { id: string; tenantId: string }) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        customerBlocks: {
          include: {
            block: {
              include: {
                category: true,
                _count: {
                  select: {
                    orderItems: true,
                  },
                },
              },
            },
          },
          orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
        },
        orders: {
          include: {
            items: {
              include: {
                category: true,
                block: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            customerBlocks: true,
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByPhoneNumber(params: {
  tenantId: string;
  phoneNumber: string;
}) {
  const normalizedPhone = params.phoneNumber.trim();

  const customer = await this.prisma.customer.findFirst({
    where: {
      tenantId: params.tenantId,
      OR: [
        { phoneNumber: normalizedPhone },
        { alternatePhone: normalizedPhone },
      ],
    },
    include: {
      customerBlocks: {
        include: {
          block: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
      },
      _count: {
        select: {
          customerBlocks: true,
          orders: true,
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  return customer;
}

async lookupCustomers(params: {
  tenantId: string;
  search?: string;
  limit?: number;
}) {
  const limit = params.limit ?? 10;
  const search = params.search?.trim();

  return this.prisma.customer.findMany({
    where: {
      tenantId: params.tenantId,
      OR: search
        ? [
            {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              phoneNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              alternatePhone: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              town: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      alternatePhone: true,
      town: true,
    },
    orderBy: {
      fullName: 'asc',
    },
    take: limit,
  });
}
}