import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    tenantSlug: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: params.tenantSlug },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const defaultRole = await this.prisma.role.findUnique({
      where: { code: 'VIEWER' },
    });

    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: params.email.toLowerCase(),
        passwordHash: params.passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        memberships: {
          create: {
            tenantId: tenant.id,
            roleId: defaultRole.id,
          },
        },
      },
    });

    return { user, tenant };
  }
}
