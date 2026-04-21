import { PrismaClient, PermissionAction } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-garments' },
    update: {},
    create: {
      name: 'Demo Garments',
      slug: 'demo-garments',
    },
  });

  const permissionSpecs = [
    ['users', PermissionAction.READ],
    ['users', PermissionAction.MANAGE],
    ['blocks', PermissionAction.CREATE],
    ['blocks', PermissionAction.READ],
    ['blocks', PermissionAction.UPDATE],
    ['blocks', PermissionAction.DELETE],
    ['audit', PermissionAction.READ],
  ] as const;

  const permissions = [] as { id: string; resource: string; action: PermissionAction }[];
  for (const [resource, action] of permissionSpecs) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource, action } },
      update: {},
      create: { resource, action },
    });
    permissions.push(permission);
  }

  const adminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {},
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full access to tenant data and admin actions',
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { code: 'VIEWER' },
    update: {},
    create: {
      code: 'VIEWER',
      name: 'Viewer',
      description: 'Read-only access to blocks',
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const viewerPermissions = permissions.filter(
    (item) => item.resource === 'blocks' && item.action === PermissionAction.READ,
  );

  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: viewerRole.id, permissionId: permission.id },
    });
  }

  const passwordHash = await argon2.hash('Admin@12345');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@helora.local' },
    update: {
      passwordHash,
      firstName: 'Helora',
      lastName: 'Admin',
    },
    create: {
      email: 'admin@helora.local',
      passwordHash,
      firstName: 'Helora',
      lastName: 'Admin',
    },
  });

  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: admin.id, tenantId: tenant.id } },
    update: { roleId: adminRole.id, isActive: true },
    create: {
      userId: admin.id,
      tenantId: tenant.id,
      roleId: adminRole.id,
    },
  });

  await prisma.block.upsert({
    where: {
      tenantId_blockNumber_category: {
        tenantId: tenant.id,
        blockNumber: 'BLK-1001',
        category: 'uniforms',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'City Hospital Uniform Block',
      town: 'Colombo',
      blockNumber: 'BLK-1001',
      category: 'uniforms',
      notes: 'Seed sample block',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
