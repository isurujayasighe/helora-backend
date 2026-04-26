import {
  PrismaClient,
  PermissionAction,
  UserStatus,
  BlockStatus,
  MeasurementFieldInputType,
  MeasurementVerificationStatus,
  GroupOrderStatus,
  OrderType,
  OrderStatus,
  OrderSource,
  PaymentStatus,
  OrderPaymentMode,
  OrderItemStatus,
  AttendanceDeviceType,
  AttendanceSyncMode,
  AttendancePunchType,
  AttendanceVerifyMode,
  AttendanceRecordStatus,
  AttendanceRecordSource,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-garments' },
    update: {
      name: 'Demo Garments',
      isActive: true,
    },
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

    ['measurement-fields', PermissionAction.CREATE],
    ['measurement-fields', PermissionAction.READ],
    ['measurement-fields', PermissionAction.UPDATE],
    ['measurement-fields', PermissionAction.DELETE],

    ['measurements', PermissionAction.CREATE],
    ['measurements', PermissionAction.READ],
    ['measurements', PermissionAction.UPDATE],
    ['measurements', PermissionAction.DELETE],

    ['orders', PermissionAction.CREATE],
    ['orders', PermissionAction.READ],
    ['orders', PermissionAction.UPDATE],
    ['orders', PermissionAction.DELETE],

    ['group-orders', PermissionAction.CREATE],
    ['group-orders', PermissionAction.READ],
    ['group-orders', PermissionAction.UPDATE],
    ['group-orders', PermissionAction.DELETE],

    ['payments', PermissionAction.CREATE],
    ['payments', PermissionAction.READ],
    ['payments', PermissionAction.UPDATE],
    ['payments', PermissionAction.DELETE],

    ['employees', PermissionAction.CREATE],
    ['employees', PermissionAction.READ],
    ['employees', PermissionAction.UPDATE],
    ['employees', PermissionAction.DELETE],

    ['attendance', PermissionAction.CREATE],
    ['attendance', PermissionAction.READ],
    ['attendance', PermissionAction.UPDATE],
    ['attendance', PermissionAction.DELETE],

    ['attendance-devices', PermissionAction.CREATE],
    ['attendance-devices', PermissionAction.READ],
    ['attendance-devices', PermissionAction.UPDATE],
    ['attendance-devices', PermissionAction.DELETE],

    ['audit', PermissionAction.READ],
  ] as const;

  const permissions: {
    id: string;
    resource: string;
    action: PermissionAction;
  }[] = [];

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
    update: {
      name: 'Super Admin',
      description: 'Full access to tenant data and admin actions',
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full access to tenant data and admin actions',
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { code: 'VIEWER' },
    update: {
      name: 'Viewer',
      description: 'Read-only access',
    },
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
      item.action === PermissionAction.READ &&
      [
        'customers',
        'categories',
        'blocks',
        'measurement-fields',
        'measurements',
        'orders',
        'group-orders',
        'payments',
        'employees',
        'attendance',
        'attendance-devices',
        'audit',
      ].includes(item.resource),
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
    update: {
      description: 'Hospital nurse uniform category',
      isActive: true,
    },
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
    update: {
      description: 'Blouse tailoring category',
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      name: 'Blouse',
      description: 'Blouse tailoring category',
      isActive: true,
    },
  });

  const uniformMeasurementFieldSpecs = [
    {
      code: 'shoulder',
      label: 'Shoulder',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 1,
      isRequired: true,
    },
    {
      code: 'chest',
      label: 'Chest',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 2,
      isRequired: true,
    },
    {
      code: 'waist',
      label: 'Waist',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 3,
      isRequired: true,
    },
    {
      code: 'hip',
      label: 'Hip',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 4,
      isRequired: false,
    },
    {
      code: 'top_length',
      label: 'Top Length',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 5,
      isRequired: true,
    },
    {
      code: 'sleeve_length',
      label: 'Sleeve Length',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 6,
      isRequired: true,
    },
    {
      code: 'pant_length',
      label: 'Pant Length',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 7,
      isRequired: false,
    },
    {
      code: 'remarks',
      label: 'Measurement Remarks',
      inputType: MeasurementFieldInputType.TEXTAREA,
      unit: null,
      sortOrder: 8,
      isRequired: false,
    },
  ] as const;

  const uniformFields: Record<string, { id: string }> = {};

  for (const field of uniformMeasurementFieldSpecs) {
    const createdField = await prisma.measurementField.upsert({
      where: {
        categoryId_code: {
          categoryId: uniformCategory.id,
          code: field.code,
        },
      },
      update: {
        tenantId: tenant.id,
        label: field.label,
        inputType: field.inputType,
        unit: field.unit,
        sortOrder: field.sortOrder,
        isRequired: field.isRequired,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: field.code,
        label: field.label,
        inputType: field.inputType,
        unit: field.unit,
        sortOrder: field.sortOrder,
        isRequired: field.isRequired,
        isActive: true,
      },
    });

    uniformFields[field.code] = {
      id: createdField.id,
    };
  }

  const blouseMeasurementFieldSpecs = [
    {
      code: 'blouse_length',
      label: 'Blouse Length',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 1,
      isRequired: true,
    },
    {
      code: 'chest',
      label: 'Chest',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 2,
      isRequired: true,
    },
    {
      code: 'waist',
      label: 'Waist',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 3,
      isRequired: true,
    },
    {
      code: 'sleeve_length',
      label: 'Sleeve Length',
      inputType: MeasurementFieldInputType.DECIMAL,
      unit: 'inch',
      sortOrder: 4,
      isRequired: true,
    },
  ] as const;

  for (const field of blouseMeasurementFieldSpecs) {
    await prisma.measurementField.upsert({
      where: {
        categoryId_code: {
          categoryId: blouseCategory.id,
          code: field.code,
        },
      },
      update: {
        tenantId: tenant.id,
        label: field.label,
        inputType: field.inputType,
        unit: field.unit,
        sortOrder: field.sortOrder,
        isRequired: field.isRequired,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        categoryId: blouseCategory.id,
        code: field.code,
        label: field.label,
        inputType: field.inputType,
        unit: field.unit,
        sortOrder: field.sortOrder,
        isRequired: field.isRequired,
        isActive: true,
      },
    });
  }

  let customer = await prisma.customer.findFirst({
    where: {
      tenantId: tenant.id,
      phoneNumber: '0718370292',
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
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
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        fullName: 'Dinesha Shamali',
        alternatePhone: '0771234567',
        hospitalName: 'Horana Hospital',
        town: 'Pasgoda',
        address: 'No 12, Main Street',
        notes: 'VIP customer',
        updatedById: admin.id,
      },
    });
  }

  const block = await prisma.block.upsert({
    where: {
      tenantId_blockNumber_categoryId: {
        tenantId: tenant.id,
        blockNumber: 'UNI-1001',
        categoryId: uniformCategory.id,
      },
    },
    update: {
      readyMadeSize: 'M',
      sizeLabel: 'Standard Medium',
      fitNotes: 'Uniform block for regular fit',
      versionNo: 1,
      description: 'Sample uniform block',
      status: BlockStatus.ACTIVE,
      remarks: 'Default uniform block',
      legacyId: 52,
      updatedById: admin.id,
    },
    create: {
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
  });

  await prisma.customerBlock.upsert({
    where: {
      customerId_blockId: {
        customerId: customer.id,
        blockId: block.id,
      },
    },
    update: {
      tenantId: tenant.id,
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

  const measurement = await prisma.measurement.upsert({
    where: {
      tenantId_measurementNumber: {
        tenantId: tenant.id,
        measurementNumber: 'MSR-00001',
      },
    },
    update: {
      customerId: customer.id,
      blockId: block.id,
      categoryId: uniformCategory.id,
      verificationStatus: MeasurementVerificationStatus.VERIFIED_OK,
      verifiedAt: new Date(),
      verifiedById: admin.id,
      verificationNote: 'Seed measurement verified by customer over phone.',
      isActive: true,
      versionNo: 1,
      notes: 'Sample nurse uniform measurement set.',
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      customerId: customer.id,
      blockId: block.id,
      categoryId: uniformCategory.id,
      measurementNumber: 'MSR-00001',
      verificationStatus: MeasurementVerificationStatus.VERIFIED_OK,
      verifiedAt: new Date(),
      verifiedById: admin.id,
      verificationNote: 'Seed measurement verified by customer over phone.',
      isActive: true,
      versionNo: 1,
      notes: 'Sample nurse uniform measurement set.',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const measurementValues = [
    {
      fieldCode: 'shoulder',
      value: '14.5',
      numericValue: 14.5,
      note: null,
    },
    {
      fieldCode: 'chest',
      value: '34',
      numericValue: 34,
      note: null,
    },
    {
      fieldCode: 'waist',
      value: '30',
      numericValue: 30,
      note: null,
    },
    {
      fieldCode: 'hip',
      value: '36',
      numericValue: 36,
      note: null,
    },
    {
      fieldCode: 'top_length',
      value: '27',
      numericValue: 27,
      note: null,
    },
    {
      fieldCode: 'sleeve_length',
      value: '8.5',
      numericValue: 8.5,
      note: null,
    },
    {
      fieldCode: 'pant_length',
      value: '38',
      numericValue: 38,
      note: null,
    },
    {
      fieldCode: 'remarks',
      value: 'Regular fit. Customer confirmed previous measurements are okay.',
      numericValue: null,
      note: 'Seed note',
    },
  ];

  for (const item of measurementValues) {
    const field = uniformFields[item.fieldCode];

    if (!field) {
      continue;
    }

    await prisma.measurementValue.upsert({
      where: {
        measurementId_fieldId: {
          measurementId: measurement.id,
          fieldId: field.id,
        },
      },
      update: {
        value: item.value,
        numericValue: item.numericValue,
        note: item.note,
      },
      create: {
        measurementId: measurement.id,
        fieldId: field.id,
        value: item.value,
        numericValue: item.numericValue,
        note: item.note,
      },
    });
  }

  const groupOrder = await prisma.groupOrder.upsert({
    where: {
      tenantId_groupOrderNumber: {
        tenantId: tenant.id,
        groupOrderNumber: 'GRP-00001',
      },
    },
    update: {
      title: 'Horana Hospital Nurses - April Batch',
      coordinatorCustomerId: customer.id,
      hospitalName: 'Horana Hospital',
      town: 'Horana',
      contactName: 'Dinesha Shamali',
      contactPhone: '0718370292',
      deliveryAddress: 'No 12, Main Street, Horana',
      deliveryTown: 'Horana',
      status: GroupOrderStatus.CONFIRMED,
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Deliver all uniforms together',
      updatedById: admin.id,
    },
    create: {
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
      status: GroupOrderStatus.CONFIRMED,
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Deliver all uniforms together',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const order = await prisma.order.upsert({
    where: {
      tenantId_orderNumber: {
        tenantId: tenant.id,
        orderNumber: 'ORD-1001',
      },
    },
    update: {
      customerId: customer.id,
      groupOrderId: groupOrder.id,
      orderType: OrderType.GROUP_MEMBER,
      hospitalName: 'Horana Hospital',
      town: 'Pasgoda',
      customerAddress: 'No 12, Main Street',
      status: OrderStatus.PENDING,
      orderSource: OrderSource.PHONE_CALL,
      paymentStatus: PaymentStatus.ADVANCE_PAID,
      paymentMode: OrderPaymentMode.CASH,
      totalQty: 1,
      totalAmount: 2500,
      advanceAmount: 1000,
      balanceAmount: 1500,
      courierCharges: 0,
      promisedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Seed sample order linked to group order and measurement.',
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      orderNumber: 'ORD-1001',
      customerId: customer.id,
      groupOrderId: groupOrder.id,
      orderType: OrderType.GROUP_MEMBER,
      hospitalName: 'Horana Hospital',
      town: 'Pasgoda',
      customerAddress: 'No 12, Main Street',
      status: OrderStatus.PENDING,
      orderSource: OrderSource.PHONE_CALL,
      paymentStatus: PaymentStatus.ADVANCE_PAID,
      paymentMode: OrderPaymentMode.CASH,
      totalQty: 1,
      totalAmount: 2500,
      advanceAmount: 1000,
      balanceAmount: 1500,
      courierCharges: 0,
      orderDate: new Date(),
      promisedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Seed sample order linked to group order and measurement.',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.orderItem.deleteMany({
    where: {
      orderId: order.id,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      categoryId: uniformCategory.id,
      blockId: block.id,
      measurementId: measurement.id,
      itemDescription: 'Nurse uniform',
      quantity: 1,
      unitPrice: 2500,
      lineTotal: 2500,
      notes: 'Seed sample uniform order item with confirmed measurement.',
      status: OrderItemStatus.PENDING,
    },
  });

  await prisma.groupOrder.update({
    where: {
      id: groupOrder.id,
    },
    data: {
      totalOrders: 1,
      totalQty: 1,
      totalAmount: 2500,
      advanceAmount: 1000,
      balanceAmount: 1500,
      courierCharges: 0,
    },
  });

  const employee1 = await prisma.employee.upsert({
    where: {
      tenantId_employeeNumber: {
        tenantId: tenant.id,
        employeeNumber: 'EMP-0001',
      },
    },
    update: {
      fullName: 'Kumari Perera',
      phoneNumber: '0711111111',
      nicNumber: '901234567V',
      designation: 'Senior Tailor',
      department: 'Tailoring',
      joinedDate: new Date('2025-01-10T00:00:00.000Z'),
      biometricUserId: '101',
      dailyWage: 2500,
      hourlyRate: 350,
      isActive: true,
      notes: 'Seed employee for attendance testing.',
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      employeeNumber: 'EMP-0001',
      fullName: 'Kumari Perera',
      phoneNumber: '0711111111',
      nicNumber: '901234567V',
      designation: 'Senior Tailor',
      department: 'Tailoring',
      joinedDate: new Date('2025-01-10T00:00:00.000Z'),
      biometricUserId: '101',
      dailyWage: 2500,
      hourlyRate: 350,
      isActive: true,
      notes: 'Seed employee for attendance testing.',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const employee2 = await prisma.employee.upsert({
    where: {
      tenantId_employeeNumber: {
        tenantId: tenant.id,
        employeeNumber: 'EMP-0002',
      },
    },
    update: {
      fullName: 'Nimali Fernando',
      phoneNumber: '0722222222',
      nicNumber: '925678901V',
      designation: 'Cutting Assistant',
      department: 'Cutting',
      joinedDate: new Date('2025-03-15T00:00:00.000Z'),
      biometricUserId: '102',
      dailyWage: 2200,
      hourlyRate: 300,
      isActive: true,
      notes: 'Seed cutting department employee.',
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      employeeNumber: 'EMP-0002',
      fullName: 'Nimali Fernando',
      phoneNumber: '0722222222',
      nicNumber: '925678901V',
      designation: 'Cutting Assistant',
      department: 'Cutting',
      joinedDate: new Date('2025-03-15T00:00:00.000Z'),
      biometricUserId: '102',
      dailyWage: 2200,
      hourlyRate: 300,
      isActive: true,
      notes: 'Seed cutting department employee.',
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  const attendanceDevice = await prisma.attendanceDevice.upsert({
    where: {
      tenantId_deviceCode: {
        tenantId: tenant.id,
        deviceCode: 'FP-HEAD-OFFICE-01',
      },
    },
    update: {
      deviceName: 'Main Shop Fingerprint Scanner',
      deviceType: AttendanceDeviceType.FINGERPRINT,
      syncMode: AttendanceSyncMode.MANUAL,
      serialNumber: 'FP-DEMO-0001',
      ipAddress: '192.168.1.120',
      port: 4370,
      location: 'Main Shop Entrance',
      isActive: true,
      lastSyncedAt: new Date(),
      notes: 'Seed fingerprint device. Replace with real device details later.',
    },
    create: {
      tenantId: tenant.id,
      deviceName: 'Main Shop Fingerprint Scanner',
      deviceCode: 'FP-HEAD-OFFICE-01',
      deviceType: AttendanceDeviceType.FINGERPRINT,
      syncMode: AttendanceSyncMode.MANUAL,
      serialNumber: 'FP-DEMO-0001',
      ipAddress: '192.168.1.120',
      port: 4370,
      location: 'Main Shop Entrance',
      isActive: true,
      lastSyncedAt: new Date(),
      notes: 'Seed fingerprint device. Replace with real device details later.',
    },
  });

  const attendanceDate = new Date('2026-04-26T00:00:00.000Z');

  const employee1CheckIn = new Date('2026-04-26T03:35:00.000Z');
  const employee1CheckOut = new Date('2026-04-26T12:05:00.000Z');

  const employee2CheckIn = new Date('2026-04-26T03:20:00.000Z');
  const employee2CheckOut = new Date('2026-04-26T11:45:00.000Z');

  const attendanceLogSeeds = [
    {
      employee: employee1,
      biometricUserId: employee1.biometricUserId!,
      punchTime: employee1CheckIn,
      punchType: AttendancePunchType.CHECK_IN,
      event: 'check-in',
    },
    {
      employee: employee1,
      biometricUserId: employee1.biometricUserId!,
      punchTime: employee1CheckOut,
      punchType: AttendancePunchType.CHECK_OUT,
      event: 'check-out',
    },
    {
      employee: employee2,
      biometricUserId: employee2.biometricUserId!,
      punchTime: employee2CheckIn,
      punchType: AttendancePunchType.CHECK_IN,
      event: 'check-in',
    },
    {
      employee: employee2,
      biometricUserId: employee2.biometricUserId!,
      punchTime: employee2CheckOut,
      punchType: AttendancePunchType.CHECK_OUT,
      event: 'check-out',
    },
  ];

  for (const log of attendanceLogSeeds) {
    await prisma.attendanceLog.upsert({
      where: {
        tenantId_biometricUserId_punchTime: {
          tenantId: tenant.id,
          biometricUserId: log.biometricUserId,
          punchTime: log.punchTime,
        },
      },
      update: {
        employeeId: log.employee.id,
        deviceId: attendanceDevice.id,
        punchType: log.punchType,
        verifyMode: AttendanceVerifyMode.FINGERPRINT,
        isProcessed: true,
        processedAt: new Date(),
        rawPayload: {
          source: 'seed',
          deviceCode: attendanceDevice.deviceCode,
          event: log.event,
        },
      },
      create: {
        tenantId: tenant.id,
        employeeId: log.employee.id,
        deviceId: attendanceDevice.id,
        biometricUserId: log.biometricUserId,
        punchTime: log.punchTime,
        punchType: log.punchType,
        verifyMode: AttendanceVerifyMode.FINGERPRINT,
        isProcessed: true,
        processedAt: new Date(),
        rawPayload: {
          source: 'seed',
          deviceCode: attendanceDevice.deviceCode,
          event: log.event,
        },
      },
    });
  }

  await prisma.attendanceRecord.upsert({
    where: {
      tenantId_employeeId_attendanceDate: {
        tenantId: tenant.id,
        employeeId: employee1.id,
        attendanceDate,
      },
    },
    update: {
      firstIn: employee1CheckIn,
      lastOut: employee1CheckOut,
      status: AttendanceRecordStatus.LATE,
      source: AttendanceRecordSource.DEVICE,
      totalMinutes: 510,
      lateMinutes: 5,
      overtimeMinutes: 30,
      expectedInTime: '09:00',
      expectedOutTime: '17:00',
      notes: 'Seed attendance record generated from fingerprint logs.',
      approvedById: admin.id,
      approvedAt: new Date(),
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      employeeId: employee1.id,
      attendanceDate,
      firstIn: employee1CheckIn,
      lastOut: employee1CheckOut,
      status: AttendanceRecordStatus.LATE,
      source: AttendanceRecordSource.DEVICE,
      totalMinutes: 510,
      lateMinutes: 5,
      overtimeMinutes: 30,
      expectedInTime: '09:00',
      expectedOutTime: '17:00',
      notes: 'Seed attendance record generated from fingerprint logs.',
      approvedById: admin.id,
      approvedAt: new Date(),
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  await prisma.attendanceRecord.upsert({
    where: {
      tenantId_employeeId_attendanceDate: {
        tenantId: tenant.id,
        employeeId: employee2.id,
        attendanceDate,
      },
    },
    update: {
      firstIn: employee2CheckIn,
      lastOut: employee2CheckOut,
      status: AttendanceRecordStatus.PRESENT,
      source: AttendanceRecordSource.DEVICE,
      totalMinutes: 505,
      lateMinutes: 0,
      overtimeMinutes: 15,
      expectedInTime: '09:00',
      expectedOutTime: '17:00',
      notes: 'Seed attendance record generated from fingerprint logs.',
      approvedById: admin.id,
      approvedAt: new Date(),
      updatedById: admin.id,
    },
    create: {
      tenantId: tenant.id,
      employeeId: employee2.id,
      attendanceDate,
      firstIn: employee2CheckIn,
      lastOut: employee2CheckOut,
      status: AttendanceRecordStatus.PRESENT,
      source: AttendanceRecordSource.DEVICE,
      totalMinutes: 505,
      lateMinutes: 0,
      overtimeMinutes: 15,
      expectedInTime: '09:00',
      expectedOutTime: '17:00',
      notes: 'Seed attendance record generated from fingerprint logs.',
      approvedById: admin.id,
      approvedAt: new Date(),
      createdById: admin.id,
      updatedById: admin.id,
    },
  });

  console.log('Seed completed successfully');
  console.log('Login email: admin@helora.local');
  console.log('Login password: Admin@12345');
  console.log(`Tenant ID: ${tenant.id}`);
  console.log(`Customer ID: ${customer.id}`);
  console.log(`Block ID: ${block.id}`);
  console.log(`Measurement ID: ${measurement.id}`);
  console.log(`Group Order ID: ${groupOrder.id}`);
  console.log(`Order ID: ${order.id}`);
  console.log(`Employee 1 ID: ${employee1.id}`);
  console.log(`Employee 2 ID: ${employee2.id}`);
  console.log(`Attendance Device ID: ${attendanceDevice.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });