import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createCategory(params: { tenantId: string; name: string; description?: string; actorUserId: string }) {
    const category = await this.prisma.category.create({
      data: {
        tenantId: params.tenantId,
        name: params.name,
        description: params.description,
      },
      include: {
        _count: { select: { blocks: true, orderItems: true } },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'category',
      entityId: category.id,
      metadata: { name: category.name },
    });

    return category;
  }

  async updateCategory(params: { id: string; tenantId: string; name?: string; description?: string | null }) {
    await this.ensureCategory(params.id, params.tenantId);

    await this.prisma.category.update({
      where: { id: params.id },
      data: {
        name: params.name,
        description: params.description,
      },
    });

    return this.getCategoryById({ id: params.id, tenantId: params.tenantId });
  }

  async deleteCategory(params: { id: string; tenantId: string; actorUserId: string }) {
    const existing = await this.prisma.category.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: { _count: { select: { blocks: true, orderItems: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing._count.blocks > 0 || existing._count.orderItems > 0) {
      throw new BadRequestException('Cannot delete category that is used by blocks or order items');
    }

    await this.prisma.category.delete({ where: { id: params.id } });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'category',
      entityId: params.id,
      metadata: { name: existing.name },
    });
  }

  async listCategories(params: { tenantId: string; search?: string }) {
    return this.prisma.category.findMany({
      where: {
        tenantId: params.tenantId,
        OR: params.search
          ? [
              { name: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        _count: { select: { blocks: true, orderItems: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryById(params: { id: string; tenantId: string }) {
    const category = await this.prisma.category.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        _count: { select: { blocks: true, orderItems: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async ensureCategory(id: string, tenantId: string) {
    const category = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
