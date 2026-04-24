import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BlocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createBlock(params: {
    tenantId: string;
    categoryId: string;
    blockNumber: string;
    readyMadeSize?: string;
    sizeLabel?: string;
    fitNotes?: string;
    versionNo?: number;
    previousBlockId?: string;
    description?: string;
    status?: string;
    remarks?: string;
    legacyId?: number;
    customers: Array<{
      customerId: string;
      isDefault?: boolean;
    }>;
    actorUserId: string;
  }) {
    const uniqueCustomerIds = [...new Set(params.customers.map((c) => c.customerId))];

    if (uniqueCustomerIds.length !== params.customers.length) {
      throw new BadRequestException('Duplicate customers are not allowed.');
    }

    const defaultCount = params.customers.filter((c) => c.isDefault).length;
    if (defaultCount > 1) {
      throw new BadRequestException('Only one default customer assignment is allowed.');
    }

    const customers = await this.prisma.customer.findMany({
      where: {
        tenantId: params.tenantId,
        id: { in: uniqueCustomerIds },
      },
      select: { id: true },
    });

    if (customers.length !== uniqueCustomerIds.length) {
      throw new NotFoundException('One or more customers were not found.');
    }

    const block = await this.prisma.block.create({
      data: {
        tenantId: params.tenantId,
        categoryId: params.categoryId,
        blockNumber: params.blockNumber,
        readyMadeSize: params.readyMadeSize,
        sizeLabel: params.sizeLabel,
        fitNotes: params.fitNotes,
        versionNo: params.versionNo ?? 1,
        previousBlockId: params.previousBlockId,
        description: params.description,
        status: params.status ?? 'ACTIVE',
        remarks: params.remarks,
        legacyId: params.legacyId,
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
        customerBlocks: {
          create: params.customers.map((customer) => ({
            customerId: customer.customerId,
            isDefault: customer.isDefault ?? false,
            assignedById: params.actorUserId,
          })),
        },
      },
      include: {
        category: true,
        customerBlocks: {
          include: {
            customer: true,
          },
          orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'block',
      entityId: block.id,
      metadata: {
        blockNumber: block.blockNumber,
        categoryId: block.categoryId,
        customerIds: uniqueCustomerIds,
      },
    });

    return block;
  }

  async updateBlock(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
    categoryId?: string;
    blockNumber?: string;
    readyMadeSize?: string;
    sizeLabel?: string;
    fitNotes?: string;
    versionNo?: number;
    previousBlockId?: string | null;
    description?: string;
    status?: string;
    remarks?: string;
    legacyId?: number | null;
    customers?: Array<{
      customerId: string;
      isDefault?: boolean;
    }>;
  }) {
    const existing = await this.prisma.block.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Block not found.');
    }

    if (params.customers) {
      const uniqueCustomerIds = [...new Set(params.customers.map((c) => c.customerId))];

      if (uniqueCustomerIds.length !== params.customers.length) {
        throw new BadRequestException('Duplicate customers are not allowed.');
      }

      const defaultCount = params.customers.filter((c) => c.isDefault).length;
      if (defaultCount > 1) {
        throw new BadRequestException('Only one default customer assignment is allowed.');
      }

      const customers = await this.prisma.customer.findMany({
        where: {
          tenantId: params.tenantId,
          id: { in: uniqueCustomerIds },
        },
        select: { id: true },
      });

      if (customers.length !== uniqueCustomerIds.length) {
        throw new NotFoundException('One or more customers were not found.');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.block.update({
        where: { id: params.id },
        data: {
          categoryId: params.categoryId,
          blockNumber: params.blockNumber,
          readyMadeSize: params.readyMadeSize,
          sizeLabel: params.sizeLabel,
          fitNotes: params.fitNotes,
          versionNo: params.versionNo,
          previousBlockId: params.previousBlockId,
          description: params.description,
          status: params.status,
          remarks: params.remarks,
          legacyId: params.legacyId,
          updatedById: params.actorUserId,
        },
      });

      if (params.customers) {
        await tx.customerBlock.deleteMany({
          where: {
            blockId: params.id,
          },
        });

        await tx.customerBlock.createMany({
          data: params.customers.map((customer) => ({
            blockId: params.id,
            customerId: customer.customerId,
            isDefault: customer.isDefault ?? false,
            assignedById: params.actorUserId,
          })),
        });
      }
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'block',
      entityId: params.id,
      metadata: {
        blockId: params.id,
        blockNumber: params.blockNumber,
        updatedCustomers: params.customers?.map((c) => c.customerId),
      },
    });

    return this.getBlockById({
      id: params.id,
      tenantId: params.tenantId,
    });
  }

  async updateBlockCustomers(params: {
    tenantId: string;
    blockId: string;
    customers: Array<{
      customerId: string;
      isDefault?: boolean;
    }>;
    actorUserId: string;
  }) {
    const uniqueCustomerIds = [...new Set(params.customers.map((c) => c.customerId))];

    if (uniqueCustomerIds.length !== params.customers.length) {
      throw new BadRequestException('Duplicate customers are not allowed.');
    }

    const defaultCount = params.customers.filter((c) => c.isDefault).length;
    if (defaultCount > 1) {
      throw new BadRequestException('Only one default customer assignment is allowed.');
    }

    const block = await this.prisma.block.findFirst({
      where: {
        id: params.blockId,
        tenantId: params.tenantId,
      },
      select: { id: true },
    });

    if (!block) {
      throw new NotFoundException('Block not found.');
    }

    const customers = await this.prisma.customer.findMany({
      where: {
        tenantId: params.tenantId,
        id: { in: uniqueCustomerIds },
      },
      select: { id: true },
    });

    if (customers.length !== uniqueCustomerIds.length) {
      throw new NotFoundException('One or more customers were not found.');
    }

    await this.prisma.$transaction([
      this.prisma.customerBlock.deleteMany({
        where: {
          blockId: params.blockId,
        },
      }),
      this.prisma.customerBlock.createMany({
        data: params.customers.map((customer) => ({
          blockId: params.blockId,
          customerId: customer.customerId,
          isDefault: customer.isDefault ?? false,
          assignedById: params.actorUserId,
        })),
      }),
      this.prisma.block.update({
        where: { id: params.blockId },
        data: {
          updatedById: params.actorUserId,
        },
      }),
    ]);

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'block',
      entityId: params.blockId,
      metadata: {
        customerIds: uniqueCustomerIds,
        operation: 'update-block-customers',
      },
    });

    return this.getBlockById({
      tenantId: params.tenantId,
      id: params.blockId,
    });
  }

  async deleteBlock(params: { id: string; tenantId: string; actorUserId: string }) {
    const existing = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Block not found');
    }

    await this.prisma.block.delete({ where: { id: params.id } });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'block',
      entityId: params.id,
      metadata: { orderItemCount: existing._count.orderItems },
    });
  }

  async listBlocks(params: {
    tenantId: string;
    search?: string;
    categoryId?: string;
    customerId?: string;
    status?: string;
  }) {
    return this.prisma.block.findMany({
      where: {
        tenantId: params.tenantId,
        categoryId: params.categoryId || undefined,
        status: params.status || undefined,
        customerBlocks: params.customerId
          ? {
              some: {
                customerId: params.customerId,
              },
            }
          : undefined,
        OR: params.search
          ? [
              { blockNumber: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } },
              { readyMadeSize: { contains: params.search, mode: 'insensitive' } },
              { sizeLabel: { contains: params.search, mode: 'insensitive' } },
              { remarks: { contains: params.search, mode: 'insensitive' } },
              { category: { name: { contains: params.search, mode: 'insensitive' } } },
              {
                customerBlocks: {
                  some: {
                    customer: {
                      fullName: { contains: params.search, mode: 'insensitive' },
                    },
                  },
                },
              },
              {
                customerBlocks: {
                  some: {
                    customer: {
                      phoneNumber: { contains: params.search, mode: 'insensitive' },
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: {
        category: true,
        customerBlocks: {
          include: {
            customer: true,
          },
          orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
        },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBlockById(params: { id: string; tenantId: string }) {
    const block = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        category: true,
        previousBlock: {
          select: {
            id: true,
            blockNumber: true,
            versionNo: true,
          },
        },
        nextVersions: {
          select: {
            id: true,
            blockNumber: true,
            versionNo: true,
            createdAt: true,
          },
          orderBy: { versionNo: 'asc' },
        },
        customerBlocks: {
          include: {
            customer: true,
          },
          orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
        },
        orderItems: {
          include: {
            order: true,
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }
}