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
    name: string;
    town: string;
    blockNumber: string;
    category: string;
    notes?: string;
    actorUserId: string;
  }) {
    const block = await this.prisma.block.create({
      data: {
        tenantId: params.tenantId,
        name: params.name,
        town: params.town,
        blockNumber: params.blockNumber,
        category: params.category,
        notes: params.notes,
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
      metadata: { blockNumber: block.blockNumber, category: block.category },
    });

    return block;
  }

  async updateBlock(params: {
    id: string;
    tenantId: string;
    name?: string;
    town?: string;
    blockNumber?: string;
    category?: string;
    notes?: string | null;
    actorUserId: string;
  }) {
    const existing = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Block not found');
    }

    const block = await this.prisma.block.update({
      where: { id: params.id },
      data: {
        name: params.name,
        town: params.town,
        blockNumber: params.blockNumber,
        category: params.category,
        notes: params.notes,
        updatedById: params.actorUserId,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'block',
      entityId: block.id,
    });

    return block;
  }

  async deleteBlock(params: { id: string; tenantId: string; actorUserId: string }) {
    const existing = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
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
    });
  }

  async listBlocks(params: { tenantId: string; search?: string; category?: string }) {
    return this.prisma.block.findMany({
      where: {
        tenantId: params.tenantId,
        category: params.category,
        OR: params.search
          ? [
              { name: { contains: params.search, mode: 'insensitive' } },
              { town: { contains: params.search, mode: 'insensitive' } },
              { blockNumber: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBlockById(params: { id: string; tenantId: string }) {
    const block = await this.prisma.block.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }
}
