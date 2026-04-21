import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId?: string;
    actorUserId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    path?: string;
    method?: string;
     metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        path: params.path,
        method: params.method,
        metadata: params.metadata,
      },
    });
  }
}
