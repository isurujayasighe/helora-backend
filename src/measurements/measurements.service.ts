import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMeasurementDto,
  CreateMeasurementValueDto,
} from './dto/create-measurement.dto';
import { CreateMeasurementFieldDto } from './dto/create-measurement-field.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { UpdateMeasurementFieldDto } from './dto/update-measurement-field.dto';
import { MeasurementVerificationStatusValue } from './dto/measurement-options';

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createMeasurementField(
    params: CreateMeasurementFieldDto & {
      tenantId: string;
      actorUserId: string;
    },
  ) {
    await this.validateCategory({
      tenantId: params.tenantId,
      categoryId: params.categoryId,
    });

    const field = await this.prisma.measurementField.create({
      data: {
        tenantId: params.tenantId,
        categoryId: params.categoryId,
        code: params.code.trim(),
        label: params.label.trim(),
        inputType: (params.inputType ?? 'TEXT') as any,
        unit: this.clean(params.unit),
        sortOrder: params.sortOrder ?? 0,
        isRequired: params.isRequired ?? false,
        isActive: params.isActive ?? true,
        helpText: this.clean(params.helpText),
        options: params.options === undefined ? undefined : (params.options as Prisma.InputJsonValue),
      },
      include: {
        category: true,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'measurement_field',
      entityId: field.id,
      metadata: {
        categoryId: field.categoryId,
        code: field.code,
        label: field.label,
      },
    });

    return field;
  }

  async updateMeasurementField(
    params: UpdateMeasurementFieldDto & {
      id: string;
      tenantId: string;
      actorUserId: string;
    },
  ) {
    const existing = await this.prisma.measurementField.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Measurement field not found.');
    }

    if (params.categoryId) {
      await this.validateCategory({
        tenantId: params.tenantId,
        categoryId: params.categoryId,
      });
    }

    const field = await this.prisma.measurementField.update({
      where: { id: params.id },
      data: {
        categoryId: params.categoryId,
        code: params.code?.trim(),
        label: params.label?.trim(),
        inputType: params.inputType as any,
        unit: params.unit === undefined ? undefined : this.clean(params.unit),
        sortOrder: params.sortOrder,
        isRequired: params.isRequired,
        isActive: params.isActive,
        helpText:
          params.helpText === undefined ? undefined : this.clean(params.helpText),
        options:
          params.options === undefined
            ? undefined
            : (params.options as Prisma.InputJsonValue),
      },
      include: {
        category: true,
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'measurement_field',
      entityId: field.id,
      metadata: {
        previousCode: existing.code,
        code: field.code,
      },
    });

    return field;
  }

  async listMeasurementFields(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    categoryId?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.MeasurementFieldWhereInput = {
      tenantId: params.tenantId,
      categoryId: params.categoryId || undefined,
      isActive: params.isActive,
      OR: search
        ? [
            { code: { contains: search, mode: 'insensitive' } },
            { label: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.measurementField.findMany({
        where,
        include: { category: true },
        orderBy: [{ category: { name: 'asc' } }, { sortOrder: 'asc' }],
        skip,
        take,
      }),
      this.prisma.measurementField.count({ where }),
    ]);

    return this.paginate({ items, page, pageSize, totalItems });
  }

  async createMeasurement(
    params: CreateMeasurementDto & {
      tenantId: string;
      actorUserId: string;
    },
  ) {
    await this.validateMeasurementOwnerData({
      tenantId: params.tenantId,
      customerId: params.customerId,
      blockId: params.blockId,
      categoryId: params.categoryId,
    });

    await this.validateMeasurementValues({
      tenantId: params.tenantId,
      categoryId: params.categoryId,
      values: params.values,
    });

    if (params.previousMeasurementId) {
      await this.validatePreviousMeasurement({
        tenantId: params.tenantId,
        previousMeasurementId: params.previousMeasurementId,
      });
    }

    const measurementNumber =
      params.measurementNumber?.trim() ||
      (await this.generateMeasurementNumber(params.tenantId));

    const measurement = await this.prisma.measurement.create({
      data: {
        tenantId: params.tenantId,
        customerId: params.customerId,
        blockId: params.blockId,
        categoryId: params.categoryId,
        measurementNumber,
        verificationStatus: (params.verificationStatus ?? 'NOT_VERIFIED') as any,
        verifiedAt:
          params.verificationStatus === 'VERIFIED_OK' ? new Date() : undefined,
        verifiedById:
          params.verificationStatus === 'VERIFIED_OK'
            ? params.actorUserId
            : undefined,
        verificationNote: this.clean(params.verificationNote),
        isActive: params.isActive ?? true,
        versionNo: params.versionNo ?? 1,
        previousMeasurementId: params.previousMeasurementId || undefined,
        notes: this.clean(params.notes),
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
        values: {
          create: params.values.map((value) => ({
            fieldId: value.fieldId,
            value: this.clean(value.value),
            numericValue: value.numericValue,
            note: this.clean(value.note),
          })),
        },
      },
      include: this.measurementInclude(),
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'measurement',
      entityId: measurement.id,
      metadata: {
        measurementNumber: measurement.measurementNumber,
        customerId: measurement.customerId,
        blockId: measurement.blockId,
        categoryId: measurement.categoryId,
      },
    });

    return measurement;
  }

  async updateMeasurement(
    params: UpdateMeasurementDto & {
      id: string;
      tenantId: string;
      actorUserId: string;
    },
  ) {
    const existing = await this.prisma.measurement.findFirst({
      where: {
        id: params.id,
        tenantId: params.tenantId,
      },
      include: {
        values: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Measurement not found.');
    }

    const customerId = params.customerId ?? existing.customerId;
    const blockId = params.blockId ?? existing.blockId;
    const categoryId = params.categoryId ?? existing.categoryId;

    await this.validateMeasurementOwnerData({
      tenantId: params.tenantId,
      customerId,
      blockId,
      categoryId,
    });

    if (params.values) {
      if (!params.values.length) {
        throw new BadRequestException('At least one measurement value is required.');
      }

      await this.validateMeasurementValues({
        tenantId: params.tenantId,
        categoryId,
        values: params.values,
      });
    }

    if (params.previousMeasurementId) {
      if (params.previousMeasurementId === params.id) {
        throw new BadRequestException(
          'Previous measurement cannot be the same measurement.',
        );
      }

      await this.validatePreviousMeasurement({
        tenantId: params.tenantId,
        previousMeasurementId: params.previousMeasurementId,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.measurement.update({
        where: { id: params.id },
        data: {
          customerId: params.customerId,
          blockId: params.blockId,
          categoryId: params.categoryId,
          measurementNumber: params.measurementNumber?.trim(),
          verificationStatus: params.verificationStatus as any,
          verifiedAt:
            params.verificationStatus === 'VERIFIED_OK'
              ? new Date()
              : undefined,
          verifiedById:
            params.verificationStatus === 'VERIFIED_OK'
              ? params.actorUserId
              : undefined,
          verificationNote:
            params.verificationNote === undefined
              ? undefined
              : this.clean(params.verificationNote),
          isActive: params.isActive,
          versionNo: params.versionNo,
          previousMeasurementId: params.previousMeasurementId,
          notes: params.notes === undefined ? undefined : this.clean(params.notes),
          updatedById: params.actorUserId,
        },
      });

      if (params.values) {
        await tx.measurementValue.deleteMany({
          where: { measurementId: params.id },
        });

        await tx.measurementValue.createMany({
          data: params.values.map((value) => ({
            measurementId: params.id,
            fieldId: value.fieldId,
            value: this.clean(value.value) ?? null,
            numericValue: value.numericValue,
            note: this.clean(value.note) ?? null,
          })),
        });
      }
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'measurement',
      entityId: params.id,
      metadata: {
        previousMeasurementNumber: existing.measurementNumber,
        measurementNumber: params.measurementNumber ?? existing.measurementNumber,
      },
    });

    return this.getMeasurementById({ id: params.id, tenantId: params.tenantId });
  }

  async verifyMeasurement(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
    verificationStatus?: MeasurementVerificationStatusValue;
    verificationNote?: string;
  }) {
    const existing = await this.prisma.measurement.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Measurement not found.');
    }

    const measurement = await this.prisma.measurement.update({
      where: { id: params.id },
      data: {
        verificationStatus: (params.verificationStatus ?? 'VERIFIED_OK') as any,
        verifiedAt: new Date(),
        verifiedById: params.actorUserId,
        verificationNote: this.clean(params.verificationNote),
        updatedById: params.actorUserId,
      },
      include: this.measurementInclude(),
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'measurement',
      entityId: params.id,
      metadata: {
        operation: 'verify_measurement',
        verificationStatus: measurement.verificationStatus,
      },
    });

    return measurement;
  }

  async deleteMeasurement(params: {
    id: string;
    tenantId: string;
    actorUserId: string;
  }) {
    const existing = await this.prisma.measurement.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Measurement not found.');
    }

    if (existing._count.orderItems > 0) {
      throw new BadRequestException(
        'Cannot delete this measurement because it is already used in orders. Mark it inactive instead.',
      );
    }

    await this.prisma.measurement.delete({
      where: { id: params.id },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.DELETE,
      entityType: 'measurement',
      entityId: params.id,
      metadata: {
        measurementNumber: existing.measurementNumber,
      },
    });
  }

  async listMeasurements(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    customerId?: string;
    blockId?: string;
    categoryId?: string;
    verificationStatus?: MeasurementVerificationStatusValue;
    isActive?: boolean;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.MeasurementWhereInput = {
      tenantId: params.tenantId,
      customerId: params.customerId || undefined,
      blockId: params.blockId || undefined,
      categoryId: params.categoryId || undefined,
      verificationStatus: params.verificationStatus as any,
      isActive: params.isActive,
      OR: search
        ? [
            { measurementNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } },
            { customer: { phoneNumber: { contains: search, mode: 'insensitive' } } },
            { block: { blockNumber: { contains: search, mode: 'insensitive' } } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.measurement.findMany({
        where,
        include: this.measurementInclude(),
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.measurement.count({ where }),
    ]);

    return this.paginate({ items, page, pageSize, totalItems });
  }

  async getMeasurementById(params: { id: string; tenantId: string }) {
    const measurement = await this.prisma.measurement.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      include: this.measurementInclude({ includeVersions: true, includeOrders: true }),
    });

    if (!measurement) {
      throw new NotFoundException('Measurement not found.');
    }

    return measurement;
  }

  async getLatestMeasurement(params: {
    tenantId: string;
    customerId?: string;
    blockId?: string;
    categoryId?: string;
  }) {
    if (!params.customerId && !params.blockId) {
      throw new BadRequestException('customerId or blockId is required.');
    }

    return this.prisma.measurement.findFirst({
      where: {
        tenantId: params.tenantId,
        customerId: params.customerId || undefined,
        blockId: params.blockId || undefined,
        categoryId: params.categoryId || undefined,
        isActive: true,
      },
      include: this.measurementInclude({ includeVersions: true }),
      orderBy: [{ versionNo: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private async validateCategory(params: { tenantId: string; categoryId: string }) {
    const category = await this.prisma.category.findFirst({
      where: { id: params.categoryId, tenantId: params.tenantId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
  }

 private async validateMeasurementOwnerData(params: {
  tenantId: string;
  customerId: string;
  blockId?: string | null;
  categoryId: string;
}) {
  const customer = await this.prisma.customer.findFirst({
    where: {
      id: params.customerId,
      tenantId: params.tenantId,
    },
  });

  if (!customer) {
    throw new BadRequestException("Invalid customerId.");
  }

  const category = await this.prisma.category.findFirst({
    where: {
      id: params.categoryId,
      tenantId: params.tenantId,
      isActive: true,
    },
  });

  if (!category) {
    throw new BadRequestException("Invalid categoryId.");
  }

  if (params.blockId) {
    const block = await this.prisma.block.findFirst({
      where: {
        id: params.blockId,
        tenantId: params.tenantId,
        categoryId: params.categoryId,
      },
    });

    if (!customer) throw new NotFoundException('Customer not found.');
    if (!category) throw new NotFoundException('Category not found.');
    if (!block) {
      throw new NotFoundException(
        'Block not found for this tenant/category/customer assignment.',
      );
    }
  }}

  private async validateMeasurementValues(params: {
    tenantId: string;
    categoryId: string;
    values: CreateMeasurementValueDto[];
  }) {
    const fieldIds = [...new Set(params.values.map((item) => item.fieldId))];

    if (fieldIds.length !== params.values.length) {
      throw new BadRequestException('Duplicate measurement fields are not allowed.');
    }

    const validFields = await this.prisma.measurementField.findMany({
      where: {
        id: { in: fieldIds },
        tenantId: params.tenantId,
        categoryId: params.categoryId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        label: true,
        isRequired: true,
      },
    });

    if (validFields.length !== fieldIds.length) {
      throw new NotFoundException(
        'One or more measurement fields were not found for this category.',
      );
    }

    const missingRequiredFields = validFields.filter(
      (field) =>
        field.isRequired &&
        !params.values.some(
          (value) =>
            value.fieldId === field.id &&
            (this.clean(value.value) !== undefined || value.numericValue !== undefined),
        ),
    );

    if (missingRequiredFields.length > 0) {
      throw new BadRequestException(
        `Required measurement fields are missing: ${missingRequiredFields
          .map((field) => field.label)
          .join(', ')}`,
      );
    }
  }

  private async validatePreviousMeasurement(params: {
    tenantId: string;
    previousMeasurementId: string;
  }) {
    const previous = await this.prisma.measurement.findFirst({
      where: {
        id: params.previousMeasurementId,
        tenantId: params.tenantId,
      },
      select: { id: true },
    });

    if (!previous) {
      throw new NotFoundException('Previous measurement not found.');
    }
  }

  private async generateMeasurementNumber(tenantId: string) {
    const count = await this.prisma.measurement.count({
      where: { tenantId },
    });

    return `MSR-${String(count + 1).padStart(5, '0')}`;
  }

  private measurementInclude(options?: {
  includeVersions?: boolean;
  includeOrders?: boolean;
}) {
  return {
    customer: {
      include: {
        _count: {
          select: {
            customerBlocks: true,
            orders: true,
          },
        },
      },
    },

    block: {
      include: {
        category: true,
      },
    },

    category: true,

    verifiedBy: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    },

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

    previousMeasurement: options?.includeVersions
      ? {
          select: {
            id: true,
            measurementNumber: true,
            versionNo: true,
            verificationStatus: true,
            createdAt: true,
          },
        }
      : false,

    nextMeasurements: options?.includeVersions
      ? {
          select: {
            id: true,
            measurementNumber: true,
            versionNo: true,
            verificationStatus: true,
            createdAt: true,
          },
          orderBy: {
            versionNo: "asc" as const,
          },
        }
      : false,

    orderItems: options?.includeOrders
      ? {
          include: {
            order: {
              include: {
                customer: true,
                groupOrder: true,
              },
            },
            category: true,
          },
          orderBy: {
            createdAt: "desc" as const,
          },
        }
      : false,

    _count: {
      select: {
        orderItems: true,
      },
    },
  } satisfies Prisma.MeasurementInclude;
}

  private paginate<T>(params: {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
  }) {
    const totalPages = Math.ceil(params.totalItems / params.pageSize);

    return {
      items: params.items,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems: params.totalItems,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }
}
