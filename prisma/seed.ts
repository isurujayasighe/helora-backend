import {
  PrismaClient,
  PermissionAction,
  UserStatus,
  BlockStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-garments' },
    update: {},
    create: {
      name: 'Demo Garments',
      slug: 'demo-garments',
      isActive: true,
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

    ['payments', PermissionAction.CREATE],
    ['payments', PermissionAction.READ],
    ['payments', PermissionAction.UPDATE],
    ['payments', PermissionAction.DELETE],

    ['audit', PermissionAction.READ],
  ] as const;

  const permissions = [];

  for (const [resource, action] of permissionSpecs) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
      update: {},
      create: {
        resource,
        action,
      },
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

  const passwordHash = await argon2.hash('Admin@12345');

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@helora.local',
    },
    update: {
      passwordHash,
      firstName: 'Helora',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'admin@helora.local',
      passwordHash,
      firstName: 'Helora',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
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
      isActive: true,
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
      description: 'Hospital nurse uniform category',
      isActive: true,
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
      isActive: true,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: 'Dinesha Shamali',
      phoneNumber: '0718370292',
      alternatePhone: '0771234567',
      hospitalName: 'Horana Hospital',
      town: 'Pasgoda',
      address: 'No 12, Main Street',
      notes: 'VIP customer',
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.customer.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        phoneNumber: '0718370292',
      },
    });
  });

  const block = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      categoryId: uniformCategory.id,
      blockNumber: 'UNI-1001',
      readyMadeSize: 'M',
      sizeLabel: 'Standard Medium',
      fitNotes: 'Uniform block for regular fit',
      versionNo: 1,
      description: 'Sample uniform block',
      status: BlockStatus.ACTIVE,
      remarks: 'Default uniform block',
      legacyId: 52,
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

  await prisma.customerBlock.upsert({
    where: {
      customerId_blockId: {
        customerId: customer.id,
        blockId: block.id,
      },
    },
    update: {
      isDefault: true,
      assignedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      customerId: customer.id,
      blockId: block.id,
      isDefault: true,
      assignedById: admin.id,
    },
  });

  const groupOrder = await prisma.groupOrder.create({
    data: {
      tenantId: tenant.id,
      groupOrderNumber: 'GRP-00001',
      title: 'Horana Hospital Nurses - April Batch',
      coordinatorCustomerId: customer.id,
      hospitalName: 'Horana Hospital',
      town: 'Horana',
      contactName: 'Dinesha Shamali',
      contactPhone: '0718370292',
      deliveryAddress: 'No 12, Main Street, Horana',
      deliveryTown: 'Horana',
      status: 'CONFIRMED',
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Deliver all uniforms together',
      createdById: admin.id,
      updatedById: admin.id,
    },
  }).catch(async () => {
    return prisma.groupOrder.findFirstOrThrow({
      where: {
        tenantId: tenant.id,
        groupOrderNumber: 'GRP-00001',
      },
    });
  });

  const order = await prisma.order.upsert({
    where: {
      tenantId_orderNumber: {
        tenantId: tenant.id,
        orderNumber: 'ORD-1001',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      orderNumber: 'ORD-1001',
      customerId: customer.id,
      groupOrderId: groupOrder.id,
      orderType: 'GROUP_MEMBER',
      hospitalName: 'Horana Hospital',
      town: 'Pasgoda',
      customerAddress: 'No 12, Main Street',
      status: 'PENDING',
      orderSource: 'PHONE_CALL',
      paymentStatus: 'ADVANCE_PAID',
      paymentMode: 'CASH',
      totalQty: 1,
      totalAmount: 2500,
      advanceAmount: 1000,
      balanceAmount: 1500,
      courierCharges: 0,
      orderDate: new Date(),
      promisedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Seed sample order',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      categoryId: uniformCategory.id,
      blockId: block.id,
      itemDescription: 'Nurse uniform',
      quantity: 1,
      unitPrice: 2500,
      lineTotal: 2500,
      notes: 'Seed sample uniform order item',
      status: 'PENDING',
    },
  }).catch(() => null);

  console.log('Seed completed successfully');
  console.log('Login email: admin@helora.local');
  console.log('Login password: Admin@12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });