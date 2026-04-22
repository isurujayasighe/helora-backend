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

    ['customers', PermissionAction.CREATE],
    ['customers', PermissionAction.READ],
    ['customers', PermissionAction.UPDATE],
    ['customers', PermissionAction.DELETE],

    ['categories', PermissionAction.CREATE],
    ['categories', PermissionAction.READ],
    ['categories', PermissionAction.UPDATE],
    ['categories', PermissionAction.DELETE],

    ['blocks', PermissionAction.CREATE],
    ['blocks', PermissionAction.READ],
    ['blocks', PermissionAction.UPDATE],
    ['blocks', PermissionAction.DELETE],

    ['orders', PermissionAction.CREATE],
    ['orders', PermissionAction.READ],
    ['orders', PermissionAction.UPDATE],
    ['orders', PermissionAction.DELETE],

    ['audit', PermissionAction.READ],
  ] as const;

  const permissions: {
    id: string;
    resource: string;
    action: PermissionAction;
  }[] = [];

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
      description: 'Read-only access',
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const viewerPermissions = permissions.filter(
    (item) =>
      (item.resource === 'customers' && item.action === PermissionAction.READ) ||
      (item.resource === 'categories' && item.action === PermissionAction.READ) ||
      (item.resource === 'blocks' && item.action === PermissionAction.READ) ||
      (item.resource === 'orders' && item.action === PermissionAction.READ) ||
      (item.resource === 'audit' && item.action === PermissionAction.READ),
  );

  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
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
    where: {
      userId_tenantId: {
        userId: admin.id,
        tenantId: tenant.id,
      },
    },
    update: {
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      userId: admin.id,
      tenantId: tenant.id,
      roleId: adminRole.id,
    },
  });

  const uniformCategory = await prisma.category.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'Uniform',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Uniform',
      description: 'Uniform tailoring category',
    },
  });

  const blouseCategory = await prisma.category.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'Blouse',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Blouse',
      description: 'Blouse tailoring category',
    },
  });

  const sampleCustomer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Dinesha Shamali',
      phoneNumber: '0718370292',
      town: 'Pasgoda',
      notes: 'Seed sample customer',
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.customer.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        fullName: 'Dinesha Shamali',
        phoneNumber: '0718370292',
      },
    });
  });

  const originalBlouseBlock = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      customerId: sampleCustomer.id,
      categoryId: blouseCategory.id,
      blockNumber: '34-35-B-6',
      readyMadeSize: 'M',
      sizeLabel: 'Medium Fit',
      fitNotes: 'Original blouse block',
      versionNo: 1,
      description: 'Original blouse block',
      status: 'ACTIVE',
      isDefault: false,
      remarks: 'Initial blouse block version',
      legacyId: 52,
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.block.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        blockNumber: '34-35-B-6',
        categoryId: blouseCategory.id,
      },
    });
  });

  const latestBlouseBlock = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      customerId: sampleCustomer.id,
      categoryId: blouseCategory.id,
      blockNumber: '34-35-B-6-V2',
      readyMadeSize: 'L',
      sizeLabel: 'Adjusted Large Fit',
      fitNotes: 'Customer body size changed slightly',
      versionNo: 2,
      previousBlockId: originalBlouseBlock.id,
      description: 'Adjusted blouse block',
      status: 'ACTIVE',
      isDefault: true,
      lastUsedAt: new Date(),
      remarks: 'Latest preferred blouse block',
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.block.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        blockNumber: '34-35-B-6-V2',
        categoryId: blouseCategory.id,
      },
    });
  });

  const uniformBlock = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      customerId: sampleCustomer.id,
      categoryId: uniformCategory.id,
      blockNumber: 'UNI-1001',
      readyMadeSize: 'M',
      sizeLabel: 'Standard Medium',
      fitNotes: 'Uniform block for regular fit',
      versionNo: 1,
      description: 'Sample uniform block',
      status: 'ACTIVE',
      isDefault: true,
      lastUsedAt: new Date(),
      remarks: 'Default uniform block',
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.block.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        blockNumber: 'UNI-1001',
        categoryId: uniformCategory.id,
      },
    });
  });

  const sampleOrder = await prisma.order.upsert({
    where: {
      tenantId_orderNumber: {
        tenantId: tenant.id,
        orderNumber: 'ORD-1001',
      },
    },
    update: {
      customerId: sampleCustomer.id,
      orderDate: new Date(),
      promisedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: 'Seed sample order',
      totalAmount: 2500.0,
      advanceAmount: 1000.0,
      balanceAmount: 1500.0,
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      customerId: sampleCustomer.id,
      orderNumber: 'ORD-1001',
      orderDate: new Date(),
      promisedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      notes: 'Seed sample order',
      totalAmount: 2500.0,
      advanceAmount: 1000.0,
      balanceAmount: 1500.0,
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      categoryId: uniformCategory.id,
      blockId: uniformBlock.id,
      itemDescription: 'Two uniforms for tailoring order',
      quantity: 2,
      unitPrice: 1250.0,
      lineTotal: 2500.0,
      notes: 'Seed sample uniform order item',
    },
  }).catch(() => null);

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      categoryId: blouseCategory.id,
      blockId: latestBlouseBlock.id,
      itemDescription: 'One blouse using latest adjusted block',
      quantity: 1,
      unitPrice: 1800.0,
      lineTotal: 1800.0,
      notes: 'Seed sample blouse order item',
    },
  }).catch(() => null);

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