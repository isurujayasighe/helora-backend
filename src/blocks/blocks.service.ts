import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, BlockStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

type BlockCustomerInput = {
  customerId: string;
  isDefault?: boolean;
};

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
    status?: BlockStatus;
    remarks?: string;
    legacyId?: number;
    customers: BlockCustomerInput[];
    actorUserId: string;
  }) {
    if (!params.customers?.length) {
      throw new BadRequestException('At least one customer must be assigned.');
    }

    await this.validateCategory({
      tenantId: params.tenantId,
      categoryId: params.categoryId,
    });

    if (params.previousBlockId) {
      await this.validatePreviousBlock({
        tenantId: params.tenantId,
        previousBlockId: params.previousBlockId,
      });
    }

    await this.validateCustomerAssignments({
      tenantId: params.tenantId,
      customers: params.customers,
    });

    const block = await this.prisma.$transaction(async (tx) => {
      const createdBlock = await tx.block.create({
        data: {
          tenantId: params.tenantId,
          categoryId: params.categoryId,
          blockNumber: params.blockNumber.trim(),
          readyMadeSize: this.clean(params.readyMadeSize),
          sizeLabel: this.clean(params.sizeLabel),
          fitNotes: this.clean(params.fitNotes),
          versionNo: params.versionNo ?? 1,
          previousBlockId: params.previousBlockId || undefined,
          description: this.clean(params.description),
          status: params.status ?? BlockStatus.ACTIVE,
          remarks: this.clean(params.remarks),
          legacyId: params.legacyId,
          createdById: params.actorUserId,
          updatedById: params.actorUserId,
        },
      });

      await tx.customerBlock.createMany({
        data: params.customers.map((customer) => ({
          tenantId: params.tenantId,
          blockId: createdBlock.id,
          customerId: customer.customerId,
          isDefault: customer.isDefault ?? false,
          assignedById: params.actorUserId,
        })),
        skipDuplicates: true,
      });

      return tx.block.findFirstOrThrow({
        where: {
          id: createdBlock.id,
          tenantId: params.tenantId,
        },
        include: this.blockInclude(),
      });
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
        customerIds: params.customers.map((customer) => customer.customerId),
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
    status?: BlockStatus;
    remarks?: string;
    legacyId?: number | null;
    customers?: BlockCustomerInput[];
  }) {
    const existing = await this.prisma.block.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
        blockNumber: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Block not found.');
    }

    if (params.categoryId) {
      await this.validateCategory({
        tenantId: params.tenantId,
        categoryId: params.categoryId,
      });
    }

    if (params.previousBlockId) {
      if (params.previousBlockId === params.id) {
        throw new BadRequestException('Previous block cannot be the same block.');
      }

      await this.validatePreviousBlock({
        tenantId: params.tenantId,
        previousBlockId: params.previousBlockId,
      });
    }

    if (params.customers) {
      if (!params.customers.length) {
        throw new BadRequestException('At least one customer must be assigned.');
      }

      await this.validateCustomerAssignments({
        tenantId: params.tenantId,
        customers: params.customers,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.block.update({
        where: {
          id: params.id,
        },
        data: {
          categoryId: params.categoryId,
          blockNumber: params.blockNumber?.trim(),
          readyMadeSize:
            params.readyMadeSize === undefined
              ? undefined
              : this.clean(params.readyMadeSize),
          sizeLabel:
            params.sizeLabel === undefined
              ? undefined
              : this.clean(params.sizeLabel),
          fitNotes:
            params.fitNotes === undefined
              ? undefined
              : this.clean(params.fitNotes),
          versionNo: params.versionNo,
          previousBlockId: params.previousBlockId,
          description:
            params.description === undefined
              ? undefined
              : this.clean(params.description),
          status: params.status,
          remarks:
            params.remarks === undefined ? undefined : this.clean(params.remarks),
          legacyId: params.legacyId,
          updatedById: params.actorUserId,
        },
      });

      if (params.customers) {
        await tx.customerBlock.deleteMany({
          where: {
            tenantId: params.tenantId,
            blockId: params.id,
          },
        });

        await tx.customerBlock.createMany({
          data: params.customers.map((customer) => ({
            tenantId: params.tenantId,
            blockId: params.id,
            customerId: customer.customerId,
            isDefault: customer.isDefault ?? false,
            assignedById: params.actorUserId,
          })),
          skipDuplicates: true,
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
        previousBlockNumber: existing.blockNumber,
        blockNumber: params.blockNumber,
        updatedCustomers: params.customers?.map((customer) => customer.customerId),
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
    customers: BlockCustomerInput[];
    actorUserId: string;
  }) {
    const block = await this.prisma.block.findFirst({
      where: {
        id: params.blockId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found.');
    }

    if (!params.customers.length) {
      throw new BadRequestException('At least one customer must be assigned.');
    }

    await this.validateCustomerAssignments({
      tenantId: params.tenantId,
      customers: params.customers,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.customerBlock.deleteMany({
        where: {
          tenantId: params.tenantId,
          blockId: params.blockId,
        },
      });

      await tx.customerBlock.createMany({
        data: params.customers.map((customer) => ({
          tenantId: params.tenantId,
          blockId: params.blockId,
          customerId: customer.customerId,
          isDefault: customer.isDefault ?? false,
          assignedById: params.actorUserId,
        })),
        skipDuplicates: true,
      });
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'block',
      entityId: params.blockId,
      metadata: {
        operation: 'update_block_customers',
        customerIds: params.customers.map((customer) => customer.customerId),
      },
    });

    return this.getBlockById({
      id: params.blockId,
      tenantId: params.tenantId,
    });
  }

  async listBlocks(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    customerId?: string;
    status?: BlockStatus;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.BlockWhereInput = {
      tenantId: params.tenantId,
      categoryId: params.categoryId || undefined,
      status: params.status,
      customerBlocks: params.customerId
        ? {
            some: {
              customerId: params.customerId,
            },
          }
        : undefined,
      OR: search
        ? [
            {
              blockNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              readyMadeSize: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              sizeLabel: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              remarks: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              category: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              customerBlocks: {
                some: {
                  customer: {
                    fullName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
            {
              customerBlocks: {
                some: {
                  customer: {
                    phoneNumber: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.block.findMany({
        where,
        include: this.blockInclude(),
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.block.count({
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

  async getBlockById(params: { id: string; tenantId: string }) {
    const block = await this.prisma.block.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        category: true,
        previousBlock: true,
        nextVersions: {
          orderBy: {
            versionNo: 'asc',
          },
        },
        customerBlocks: {
          include: {
            customer: true,
          },
          orderBy: [{ isDefault: 'desc' }, { assignedAt: 'asc' }],
        },
        measurements: {
          include: {
            values: {
              include: {
                field: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        orderItems: {
          include: {
            category: true,
            order: {
              include: {
                customer: true,
                groupOrder: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orderItems: true,
            measurements: true,
            customerBlocks: true,
          },
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found.');
    }

    return block;
  }

  async deleteBlock(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.block.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        _count: {
          select: {
            orderItems: true,
            measurements: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Block not found.');
    }

    if (existing._count.orderItems > 0 || existing._count.measurements > 0) {
      throw new BadRequestException(
        'Cannot delete this block because it is already used in orders or measurements.',
      );
    }

    await this.prisma.block.delete({
      where: {
        id: params.id,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'block',
      entityId: params.id,
      metadata: {
        blockNumber: existing.blockNumber,
      },
    });

    return {
      success: true,
    };
  }

  private async validateCategory(params: {
    tenantId: string;
    categoryId: string;
  }) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: params.categoryId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
  }

  private async validatePreviousBlock(params: {
    tenantId: string;
    previousBlockId: string;
  }) {
    const previousBlock = await this.prisma.block.findFirst({
      where: {
        id: params.previousBlockId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!previousBlock) {
      throw new NotFoundException('Previous block not found.');
    }
  }

  private async validateCustomerAssignments(params: {
    tenantId: string;
    customers: BlockCustomerInput[];
  }) {
    const uniqueCustomerIds = [
      ...new Set(params.customers.map((customer) => customer.customerId)),
    ];

    if (uniqueCustomerIds.length !== params.customers.length) {
      throw new BadRequestException('Duplicate customers are not allowed.');
    }

    const defaultCount = params.customers.filter(
      (customer) => customer.isDefault,
    ).length;

    if (defaultCount > 1) {
      throw new BadRequestException(
        'Only one default customer assignment is allowed.',
      );
    }

    const validCustomers = await this.prisma.customer.findMany({
      where: {
        tenantId: params.tenantId,
        id: {
          in: uniqueCustomerIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (validCustomers.length !== uniqueCustomerIds.length) {
      throw new NotFoundException('One or more customers were not found.');
    }
  }

  private blockInclude() {
    return {
      category: true,
      customerBlocks: {
        include: {
          customer: true,
        },
        orderBy: [{ isDefault: 'desc' as const }, { assignedAt: 'asc' as const }],
      },
      _count: {
        select: {
          orderItems: true,
          measurements: true,
          customerBlocks: true,
        },
      },
    };
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }
}