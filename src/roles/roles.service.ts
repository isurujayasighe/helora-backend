import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAuthorization(userId: string, tenantId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership || !membership.isActive) {
      return null;
    }

    const roles = [membership.role.code];

    const permissions = membership.role.rolePermissions.map(
      (item) =>
        `${item.permission.resource}:${item.permission.action.toLowerCase()}`,
    );

    return {
      membership,
      roles,
      permissions,
    };
  }
}