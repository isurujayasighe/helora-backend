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

    return this.getCustomerById({ id: customer.id, tenantId: params.tenantId });
  }

  async updateCustomer(params: {
    id: string;
    tenantId: string;
    fullName?: string;
    phoneNumber?: string | null;
    alternatePhone?: string | null;
    town?: string | null;
    address?: string | null;
    notes?: string | null;
    actorUserId: string;
  }) {
    const existing = await this.prisma.customer.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.update({
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
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'customer',
      entityId: params.id,
    });

    return this.getCustomerById({ id: params.id, tenantId: params.tenantId });
  }

  async deleteCustomer(params: { id: string; tenantId: string; actorUserId: string }) {
    const existing = await this.prisma.customer.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        _count: {
          select: {
            blocks: true,
            orders: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.delete({ where: { id: params.id } });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'customer',
      entityId: params.id,
      metadata: {
        blockCount: existing._count.blocks,
        orderCount: existing._count.orders,
      },
    });
  }

  async listCustomers(params: { tenantId: string; search?: string; town?: string }) {
    return this.prisma.customer.findMany({
      where: {
        tenantId: params.tenantId,
        town: params.town,
        OR: params.search
          ? [
              { fullName: { contains: params.search, mode: 'insensitive' } },
              { phoneNumber: { contains: params.search, mode: 'insensitive' } },
              { alternatePhone: { contains: params.search, mode: 'insensitive' } },
              { town: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        _count: {
          select: {
            blocks: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomerById(params: { id: string; tenantId: string }) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        blocks: {
          include: {
            category: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: {
            items: {
              include: {
                category: true,
                block: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            blocks: true,
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
}
