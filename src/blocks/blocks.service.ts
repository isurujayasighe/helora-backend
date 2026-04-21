import { Injectable, NotFoundException } from '@nestjs/common';
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
    customerId: string;
    categoryId: string;
    blockNumber: string;
    description?: string;
    status?: string;
    remarks?: string;
    legacyId?: number;
    actorUserId: string;
  }) {
    const block = await this.prisma.block.create({
      data: {
        tenantId: params.tenantId,
        customerId: params.customerId,
        categoryId: params.categoryId,
        blockNumber: params.blockNumber,
        description: params.description,
        status: params.status ?? 'ACTIVE',
        remarks: params.remarks,
        legacyId: params.legacyId,
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
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
        customerId: block.customerId,
        categoryId: block.categoryId,
      },
    });

    return this.getBlockById({ id: block.id, tenantId: params.tenantId });
  }

  async updateBlock(params: {
    id: string;
    tenantId: string;
    customerId?: string;
    categoryId?: string;
    blockNumber?: string;
    description?: string;
    status?: string;
    remarks?: string | null;
    legacyId?: number | null;
    actorUserId: string;
  }) {
    const existing = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Block not found');
    }

    await this.prisma.block.update({
      where: { id: params.id },
      data: {
        customerId: params.customerId,
        categoryId: params.categoryId,
        blockNumber: params.blockNumber,
        description: params.description,
        status: params.status,
        remarks: params.remarks,
        legacyId: params.legacyId,
        updatedById: params.actorUserId,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'block',
      entityId: params.id,
    });

    return this.getBlockById({ id: params.id, tenantId: params.tenantId });
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

  async listBlocks(params: { tenantId: string; search?: string; categoryId?: string; customerId?: string; status?: string }) {
    return this.prisma.block.findMany({
      where: {
        tenantId: params.tenantId,
        categoryId: params.categoryId,
        customerId: params.customerId,
        status: params.status,
        OR: params.search
          ? [
              { blockNumber: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } },
              { customer: { fullName: { contains: params.search, mode: 'insensitive' } } },
              { customer: { phoneNumber: { contains: params.search, mode: 'insensitive' } } },
              { category: { name: { contains: params.search, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: {
        customer: true,
        category: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBlockById(params: { id: string; tenantId: string }) {
    const block = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        customer: true,
        category: true,
        orderItems: {
          include: {
            order: true,
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }
}
