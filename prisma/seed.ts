// prisma/seed.ts

import {
  PrismaClient,
  PermissionAction,
  UserStatus,
  BlockStatus,
  MeasurementFieldInputType,
  MeasurementVerificationStatus,
  GroupOrderStatus,
  OrderType,
  OrderSource,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus,
  OrderPaymentMode,
  PaymentCategory,
  PaymentMethod,
  PaymentRecordStatus,
  AttendanceDeviceType,
  AttendanceSyncMode,
  AttendancePunchType,
  AttendanceVerifyMode,
  AttendanceRecordStatus,
  AttendanceRecordSource,
  AuditAction,
  WhatsappTemplateCategory,
  WhatsappTemplateStatus,
  WhatsappMessageDirection,
  WhatsappMessageType,
  WhatsappMessageStatus,
} from "@prisma/client";

import * as argon2 from "argon2";

const prisma = new PrismaClient();

const DEMO_TENANT_SLUG = "demo-garments";

const DEMO_PASSWORD = "Admin@123";
// demo password idea: Admin@123
// This is only seed/demo data. Use a real bcrypt hash in production.

function money(value: number) {
  return value.toFixed(2);
}

function date(value: string) {
  return new Date(value);
}

async function seedRolesAndPermissions() {
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: "SUPER_ADMIN" },
      update: {
        name: "Super Admin",
        description: "Full system access",
      },
      create: {
        code: "SUPER_ADMIN",
        name: "Super Admin",
        description: "Full system access",
      },
    }),
    prisma.role.upsert({
      where: { code: "MANAGER" },
      update: {
        name: "Manager",
        description: "Factory manager access",
      },
      create: {
        code: "MANAGER",
        name: "Manager",
        description: "Factory manager access",
      },
    }),
    prisma.role.upsert({
      where: { code: "STAFF" },
      update: {
        name: "Staff",
        description: "Daily operation access",
      },
      create: {
        code: "STAFF",
        name: "Staff",
        description: "Daily operation access",
      },
    }),
  ]);

  const resources = [
  "dashboard",
  "customers",
  "blocks",
  "measurements",
  "orders",
  "group-orders",
  "payments",
  "employees",
  "attendance",
  "whatsapp",
  "settings",
  "users",
  "roles",
  "audit-logs",
  ];

  const actions = [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.MANAGE,
  ];

  const permissions = [];

  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
        update: {
          description: `${action} access for ${resource}`,
        },
        create: {
          resource,
          action,
          description: `${action} access for ${resource}`,
        },
      });

      permissions.push(permission);
    }
  }

  const superAdminRole = roles.find((role) => role.code === "SUPER_ADMIN")!;
  const managerRole = roles.find((role) => role.code === "MANAGER")!;
  const staffRole = roles.find((role) => role.code === "STAFF")!;

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const managerAllowedResources = [
   "dashboard",
  "customers",
  "blocks",
  "measurements",
  "orders",
  "group-orders",
  "payments",
  "employees",
  "attendance",
  "whatsapp",
  "settings",
  "users",
  "roles",
  "audit-logs",
  ];

  const managerAllowedActions = [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
  ];

  for (const permission of permissions) {
    if (
      managerAllowedResources.includes(permission.resource) &&
      managerAllowedActions.includes("CREATE")
    ) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const staffAllowedResources = [
    "dashboard",
    "customers",
    "blocks",
    "measurements",
    "orders",
    "group-orders",
  ];

  const staffAllowedActions = [PermissionAction.READ, PermissionAction.UPDATE];

  for (const permission of permissions) {
    if (
      staffAllowedResources.includes(permission.resource) &&
      staffAllowedActions.includes("READ")
    ) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: staffRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: staffRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  return {
    superAdminRole,
    managerRole,
    staffRole,
  };
}

async function seedUsers(passwordHash: string) {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@helora.local" },
    update: {
      firstName: "Helora",
      lastName: "Admin",
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: "admin@helora.local",
      passwordHash,
      firstName: "Helora",
      lastName: "Admin",
      status: UserStatus.ACTIVE,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@helora.local" },
    update: {
      firstName: "Factory",
      lastName: "Manager",
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: "manager@helora.local",
      passwordHash,
      firstName: "Factory",
      lastName: "Manager",
      status: UserStatus.ACTIVE,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@helora.local" },
    update: {
      firstName: "Front Desk",
      lastName: "Staff",
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: "staff@helora.local",
      passwordHash,
      firstName: "Front Desk",
      lastName: "Staff",
      status: UserStatus.ACTIVE,
    },
  });

  return {
    adminUser,
    managerUser,
    staffUser,
  };
}

async function main() {

    console.log("🌱 Starting Helora seed...");

   const demoPasswordHash = await argon2.hash(DEMO_PASSWORD);

  const roles = await seedRolesAndPermissions();
  const users = await seedUsers(demoPasswordHash);
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: DEMO_TENANT_SLUG },
  });

if (existingTenant) {
  console.log("🧹 Removing old demo tenant data...");

  await prisma.$transaction(async (tx) => {
    const tenantId = existingTenant.id;

    /**
     * ------------------------------------------------------
     * Delete child records first
     * ------------------------------------------------------
     */

    const measurements = await tx.measurement.findMany({
      where: { tenantId },
      select: { id: true },
    });

    const measurementIds = measurements.map((item) => item.id);

    if (measurementIds.length > 0) {
      await tx.measurementValue.deleteMany({
        where: {
          measurementId: {
            in: measurementIds,
          },
        },
      });
    }

    await tx.whatsappMessage.deleteMany({
      where: { tenantId },
    });

    await tx.whatsappTemplate.deleteMany({
      where: { tenantId },
    });

    await tx.whatsappAccount.deleteMany({
      where: { tenantId },
    });

    await tx.auditLog.deleteMany({
      where: { tenantId },
    });

    await tx.attendanceRecord.deleteMany({
      where: { tenantId },
    });

    await tx.attendanceLog.deleteMany({
      where: { tenantId },
    });

    await tx.attendanceDevice.deleteMany({
      where: { tenantId },
    });

    await tx.payment.deleteMany({
      where: { tenantId },
    });

    await tx.order.deleteMany({
      where: { tenantId },
    });

    await tx.groupOrder.deleteMany({
      where: { tenantId },
    });

    await tx.measurement.deleteMany({
      where: { tenantId },
    });

    await tx.customerBlock.deleteMany({
      where: { tenantId },
    });

    await tx.block.deleteMany({
      where: { tenantId },
    });

    await tx.measurementField.deleteMany({
      where: { tenantId },
    });

    await tx.category.deleteMany({
      where: { tenantId },
    });

    await tx.employee.deleteMany({
      where: { tenantId },
    });

    await tx.customer.deleteMany({
      where: { tenantId },
    });

    await tx.membership.deleteMany({
      where: { tenantId },
    });

    await tx.tenant.delete({
      where: { id: tenantId },
    });
  });
}

  console.log("🏢 Creating tenant...");

  const tenant = await prisma.tenant.create({
    data: {
      name: "New Deepani Garment",
      slug: DEMO_TENANT_SLUG,
      isActive: true,
    },
  });

  console.log("👥 Creating memberships...");

  await prisma.membership.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: users.adminUser.id,
        roleId: roles.superAdminRole.id,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        userId: users.managerUser.id,
        roleId: roles.managerRole.id,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        userId: users.staffUser.id,
        roleId: roles.staffRole.id,
        isActive: true,
      },
    ],
  });

  console.log("🧵 Creating categories...");

  const sareeCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: "Saree",
      description: "Saree blouse and related tailoring items",
      isActive: true,
    },
  });

  const uniformCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: "Uniform",
      description: "Hospital nurses uniforms",
      isActive: true,
    },
  });

  const otherCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: "Other",
      description: "Other garment items",
      isActive: true,
    },
  });

  console.log("📏 Creating measurement fields...");

  const sareeFields = await prisma.$transaction([
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "SHOULDER",
        label: "Shoulder",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 1,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "CHEST",
        label: "Chest",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 2,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "WAIST",
        label: "Waist",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 3,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "BLOUSE_LENGTH",
        label: "Blouse Length",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 4,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "SLEEVE_LENGTH",
        label: "Sleeve Length",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 5,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: sareeCategory.id,
        code: "NECK_TYPE",
        label: "Neck Type",
        inputType: MeasurementFieldInputType.SELECT,
        sortOrder: 6,
        options: ["Round", "V Neck", "Square", "Boat Neck"],
      },
    }),
  ]);

  const uniformFields = await prisma.$transaction([
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "SHOULDER",
        label: "Shoulder",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 1,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "CHEST",
        label: "Chest",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 2,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "WAIST",
        label: "Waist",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 3,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "HIP",
        label: "Hip",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 4,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "TOP_LENGTH",
        label: "Top Length",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 5,
        isRequired: true,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "SKIRT_LENGTH",
        label: "Skirt Length",
        inputType: MeasurementFieldInputType.DECIMAL,
        unit: "inch",
        sortOrder: 6,
      },
    }),
    prisma.measurementField.create({
      data: {
        tenantId: tenant.id,
        categoryId: uniformCategory.id,
        code: "SIZE",
        label: "Ready Made Size",
        inputType: MeasurementFieldInputType.SELECT,
        sortOrder: 7,
        options: ["XS", "S", "M", "L", "XL", "XXL"],
      },
    }),
  ]);

  await prisma.measurementField.create({
    data: {
      tenantId: tenant.id,
      categoryId: otherCategory.id,
      code: "DESCRIPTION",
      label: "Description",
      inputType: MeasurementFieldInputType.TEXTAREA,
      sortOrder: 1,
      isRequired: true,
    },
  });

  console.log("🙋 Creating customers...");

  const dinesha = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: "Dinesha Shamali",
      phoneNumber: "0718370292",
      alternatePhone: "0771234567",
      hospitalName: "Horana Hospital",
      town: "Pasgoda",
      address: "No 12, Main Street, Pasgoda",
      notes: "Seed sample customer. Usually orders nurse uniforms.",
      createdById: users.adminUser.id,
      updatedById: users.adminUser.id,
    },
  });

  const kaveesha = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: "Kaveesha Perera",
      phoneNumber: "0714567890",
      alternatePhone: "0762223344",
      hospitalName: "Kalutara Hospital",
      town: "Kalutara",
      address: "Station Road, Kalutara",
      notes: "Prefers loose fit.",
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
    },
  });

  const nimali = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: "Nimali Fernando",
      phoneNumber: "0778899001",
      hospitalName: "Horana Hospital",
      town: "Horana",
      address: "Temple Road, Horana",
      notes: "Group order member.",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
    },
  });

  const chamari = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: "Chamari Silva",
      phoneNumber: "0756781234",
      hospitalName: "Panadura Hospital",
      town: "Panadura",
      address: "Lake Road, Panadura",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
    },
  });

  console.log("🧱 Creating blocks...");

  const sareeBlockDinesha = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      categoryId: sareeCategory.id,
      blockNumber: "SAR-0001",
      readyMadeSize: "M",
      sizeLabel: "Medium",
      fitNotes: "Normal fit",
      versionNo: 1,
      description: "Saree blouse block for Dinesha",
      status: BlockStatus.ACTIVE,
      lastUsedAt: date("2026-04-21T08:30:00.000Z"),
      remarks: "Legacy block migrated from physical file.",
      legacyId: 1001,
      createdById: users.adminUser.id,
      updatedById: users.adminUser.id,
    },
  });

  const uniformBlockDinesha = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      categoryId: uniformCategory.id,
      blockNumber: "UNI-0001",
      readyMadeSize: "M",
      sizeLabel: "Medium",
      fitNotes: "Slightly loose shoulder",
      versionNo: 1,
      description: "Nurse uniform block for Dinesha",
      status: BlockStatus.ACTIVE,
      lastUsedAt: date("2026-04-26T09:00:00.000Z"),
      remarks: "Good for repeat hospital uniform orders.",
      legacyId: 2001,
      createdById: users.adminUser.id,
      updatedById: users.managerUser.id,
    },
  });

  const uniformBlockKaveesha = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      categoryId: uniformCategory.id,
      blockNumber: "UNI-0002",
      readyMadeSize: "L",
      sizeLabel: "Large",
      fitNotes: "Loose fit",
      versionNo: 1,
      description: "Nurse uniform block for Kaveesha",
      status: BlockStatus.ACTIVE,
      lastUsedAt: date("2026-04-24T09:45:00.000Z"),
      legacyId: 2002,
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
    },
  });

  const uniformBlockNimali = await prisma.block.create({
    data: {
      tenantId: tenant.id,
      categoryId: uniformCategory.id,
      blockNumber: "UNI-0003",
      readyMadeSize: "S",
      sizeLabel: "Small",
      fitNotes: "Slim fit",
      versionNo: 1,
      description: "Nurse uniform block for Nimali",
      status: BlockStatus.ACTIVE,
      legacyId: 2003,
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
    },
  });

  console.log("🔗 Assigning customer blocks...");

  await prisma.customerBlock.createMany({
    data: [
      {
        tenantId: tenant.id,
        customerId: dinesha.id,
        blockId: sareeBlockDinesha.id,
        isDefault: false,
        assignedById: users.adminUser.id,
      },
      {
        tenantId: tenant.id,
        customerId: dinesha.id,
        blockId: uniformBlockDinesha.id,
        isDefault: true,
        assignedById: users.adminUser.id,
      },
      {
        tenantId: tenant.id,
        customerId: kaveesha.id,
        blockId: uniformBlockKaveesha.id,
        isDefault: true,
        assignedById: users.managerUser.id,
      },
      {
        tenantId: tenant.id,
        customerId: nimali.id,
        blockId: uniformBlockNimali.id,
        isDefault: true,
        assignedById: users.staffUser.id,
      },
    ],
  });

  console.log("📐 Creating measurements...");

  const dineshaUniformMeasurement = await prisma.measurement.create({
    data: {
      tenantId: tenant.id,
      customerId: dinesha.id,
      blockId: uniformBlockDinesha.id,
      categoryId: uniformCategory.id,
      measurementNumber: "MES-00001",
      verificationStatus: MeasurementVerificationStatus.VERIFIED_OK,
      verifiedAt: date("2026-04-26T10:00:00.000Z"),
      verifiedById: users.managerUser.id,
      verificationNote: "Customer confirmed latest measurements are okay.",
      isActive: true,
      versionNo: 1,
      notes: "Uniform measurement for Horana Hospital order.",
      createdById: users.staffUser.id,
      updatedById: users.managerUser.id,
    },
  });

  await prisma.measurementValue.createMany({
    data: [
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[0].id,
        value: "14.50",
        numericValue: money(14.5),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[1].id,
        value: "36.00",
        numericValue: money(36),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[2].id,
        value: "30.00",
        numericValue: money(30),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[3].id,
        value: "38.00",
        numericValue: money(38),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[4].id,
        value: "27.00",
        numericValue: money(27),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[5].id,
        value: "36.00",
        numericValue: money(36),
      },
      {
        measurementId: dineshaUniformMeasurement.id,
        fieldId: uniformFields[6].id,
        value: "M",
      },
    ],
  });

  const dineshaSareeMeasurement = await prisma.measurement.create({
    data: {
      tenantId: tenant.id,
      customerId: dinesha.id,
      blockId: sareeBlockDinesha.id,
      categoryId: sareeCategory.id,
      measurementNumber: "MES-00002",
      verificationStatus: MeasurementVerificationStatus.NEEDS_UPDATE,
      verificationNote: "Customer asked to recheck blouse length.",
      isActive: true,
      versionNo: 1,
      notes: "Older saree blouse measurement.",
      createdById: users.adminUser.id,
      updatedById: users.adminUser.id,
    },
  });

  await prisma.measurementValue.createMany({
    data: [
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[0].id,
        value: "14.00",
        numericValue: money(14),
      },
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[1].id,
        value: "35.50",
        numericValue: money(35.5),
      },
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[2].id,
        value: "29.00",
        numericValue: money(29),
      },
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[3].id,
        value: "15.00",
        numericValue: money(15),
      },
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[4].id,
        value: "9.00",
        numericValue: money(9),
      },
      {
        measurementId: dineshaSareeMeasurement.id,
        fieldId: sareeFields[5].id,
        value: "Round",
      },
    ],
  });

  const kaveeshaUniformMeasurement = await prisma.measurement.create({
    data: {
      tenantId: tenant.id,
      customerId: kaveesha.id,
      blockId: uniformBlockKaveesha.id,
      categoryId: uniformCategory.id,
      measurementNumber: "MES-00003",
      verificationStatus: MeasurementVerificationStatus.UPDATED,
      verifiedAt: date("2026-04-24T11:15:00.000Z"),
      verifiedById: users.managerUser.id,
      verificationNote: "Updated waist and top length.",
      isActive: true,
      versionNo: 2,
      notes: "Latest uniform measurement.",
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
    },
  });

  await prisma.measurementValue.createMany({
    data: [
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[0].id,
        value: "15.00",
        numericValue: money(15),
      },
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[1].id,
        value: "39.00",
        numericValue: money(39),
      },
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[2].id,
        value: "33.00",
        numericValue: money(33),
      },
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[3].id,
        value: "41.00",
        numericValue: money(41),
      },
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[4].id,
        value: "28.00",
        numericValue: money(28),
      },
      {
        measurementId: kaveeshaUniformMeasurement.id,
        fieldId: uniformFields[6].id,
        value: "L",
      },
    ],
  });

  const nimaliUniformMeasurement = await prisma.measurement.create({
    data: {
      tenantId: tenant.id,
      customerId: nimali.id,
      blockId: uniformBlockNimali.id,
      categoryId: uniformCategory.id,
      measurementNumber: "MES-00004",
      verificationStatus: MeasurementVerificationStatus.NOT_VERIFIED,
      isActive: true,
      versionNo: 1,
      notes: "Need verification before cutting.",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
    },
  });

  await prisma.measurementValue.createMany({
    data: [
      {
        measurementId: nimaliUniformMeasurement.id,
        fieldId: uniformFields[0].id,
        value: "13.50",
        numericValue: money(13.5),
      },
      {
        measurementId: nimaliUniformMeasurement.id,
        fieldId: uniformFields[1].id,
        value: "34.00",
        numericValue: money(34),
      },
      {
        measurementId: nimaliUniformMeasurement.id,
        fieldId: uniformFields[2].id,
        value: "28.00",
        numericValue: money(28),
      },
      {
        measurementId: nimaliUniformMeasurement.id,
        fieldId: uniformFields[4].id,
        value: "26.00",
        numericValue: money(26),
      },
      {
        measurementId: nimaliUniformMeasurement.id,
        fieldId: uniformFields[6].id,
        value: "S",
      },
    ],
  });

  console.log("🧾 Creating group order...");

  const groupOrder = await prisma.groupOrder.create({
    data: {
      tenantId: tenant.id,
      groupOrderNumber: "GRP-00001",
      coordinatorCustomerId: dinesha.id,
      title: "Horana Hospital Nurses - April Batch",
      hospitalName: "Horana Hospital",
      town: "Horana",
      contactName: "Dinesha Shamali",
      contactPhone: "0718370292",
      deliveryAddress: "No 12, Main Street, Horana",
      deliveryTown: "Horana",
      status: GroupOrderStatus.CONFIRMED,
      totalOrders: 2,
      totalQty: 5,
      totalAmount: money(22500),
      advanceAmount: money(10000),
      balanceAmount: money(12500),
      courierCharges: money(500),
      expectedDeliveryDate: date("2026-05-02T00:00:00.000Z"),
      notes: "Deliver all uniforms together.",
      createdById: users.adminUser.id,
      updatedById: users.managerUser.id,
    },
  });

  console.log("🛒 Creating orders and order items...");

  const individualOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNumber: "ORD-00001",
      customerId: dinesha.id,
      orderType: OrderType.INDIVIDUAL,
      hospitalName: "Horana Hospital",
      town: "Pasgoda",
      customerAddress: "No 12, Main Street, Pasgoda",
      status: OrderStatus.CONFIRMED,
      orderSource: OrderSource.PHYSICAL_SHOP,
      paymentStatus: PaymentStatus.ADVANCE_PAID,
      paymentMode: OrderPaymentMode.CASH,
      totalQty: 2,
      totalAmount: money(9000),
      advanceAmount: money(4000),
      balanceAmount: money(5000),
      courierCharges: money(0),
      orderDate: date("2026-04-26T08:30:00.000Z"),
      promisedDate: date("2026-05-03T00:00:00.000Z"),
      notes: "Customer came to shop and verified measurements.",
      specialNotes: "Need neat finishing around collar.",
      createdById: users.staffUser.id,
      updatedById: users.managerUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            categoryId: uniformCategory.id,
            blockId: uniformBlockDinesha.id,
            measurementId: dineshaUniformMeasurement.id,
            itemDescription: "Nurse Uniform - White",
            quantity: 2,
            unitPrice: money(4500),
            lineTotal: money(9000),
            notes: "Use existing block.",
            tailorNote: "Shoulder slightly loose. Check collar alignment.",
            status: OrderItemStatus.PENDING,
            createdById: users.staffUser.id,
            updatedById: users.managerUser.id,
          },
        ],
      },
    },
  });

  const groupMemberOrderOne = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNumber: "ORD-00002",
      customerId: kaveesha.id,
      groupOrderId: groupOrder.id,
      orderType: OrderType.GROUP_MEMBER,
      hospitalName: "Horana Hospital",
      town: "Kalutara",
      customerAddress: "Station Road, Kalutara",
      status: OrderStatus.CUTTING,
      orderSource: OrderSource.WHATSAPP,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      paymentMode: OrderPaymentMode.MIXED,
      totalQty: 3,
      totalAmount: money(13500),
      advanceAmount: money(6000),
      balanceAmount: money(7500),
      courierCharges: money(250),
      orderDate: date("2026-04-27T09:15:00.000Z"),
      promisedDate: date("2026-05-02T00:00:00.000Z"),
      notes: "Part of Horana Hospital batch.",
      specialNotes: "Loose fit requested.",
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            categoryId: uniformCategory.id,
            blockId: uniformBlockKaveesha.id,
            measurementId: kaveeshaUniformMeasurement.id,
            itemDescription: "Nurse Uniform - White",
            quantity: 3,
            unitPrice: money(4500),
            lineTotal: money(13500),
            notes: "Group order item.",
            tailorNote: "Loose fit. Do not reduce waist.",
            status: OrderItemStatus.CUTTING,
            createdById: users.managerUser.id,
            updatedById: users.managerUser.id,
          },
        ],
      },
    },
  });

  const groupMemberOrderTwo = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNumber: "ORD-00003",
      customerId: nimali.id,
      groupOrderId: groupOrder.id,
      orderType: OrderType.GROUP_MEMBER,
      hospitalName: "Horana Hospital",
      town: "Horana",
      customerAddress: "Temple Road, Horana",
      status: OrderStatus.PENDING,
      orderSource: OrderSource.PHONE_CALL,
      paymentStatus: PaymentStatus.UNPAID,
      totalQty: 2,
      totalAmount: money(9000),
      advanceAmount: money(0),
      balanceAmount: money(9000),
      courierCharges: money(250),
      orderDate: date("2026-04-27T11:00:00.000Z"),
      promisedDate: date("2026-05-02T00:00:00.000Z"),
      notes: "Need to verify measurement before cutting.",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            categoryId: uniformCategory.id,
            blockId: uniformBlockNimali.id,
            measurementId: nimaliUniformMeasurement.id,
            itemDescription: "Nurse Uniform - White",
            quantity: 2,
            unitPrice: money(4500),
            lineTotal: money(9000),
            notes: "Measurement not verified yet.",
            tailorNote: "Do not cut until measurement verification.",
            status: OrderItemStatus.PENDING,
            createdById: users.staffUser.id,
            updatedById: users.staffUser.id,
          },
        ],
      },
    },
  });

  const sareeOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNumber: "ORD-00004",
      customerId: chamari.id,
      orderType: OrderType.INDIVIDUAL,
      town: "Panadura",
      customerAddress: "Lake Road, Panadura",
      status: OrderStatus.PENDING,
      orderSource: OrderSource.DREZAURA,
      paymentStatus: PaymentStatus.UNPAID,
      totalQty: 1,
      totalAmount: money(3500),
      advanceAmount: money(0),
      balanceAmount: money(3500),
      courierCharges: money(0),
      orderDate: date("2026-04-28T10:30:00.000Z"),
      promisedDate: date("2026-05-06T00:00:00.000Z"),
      notes: "Drezaura source order. Need measurement appointment.",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
      items: {
        create: [
          {
            tenantId: tenant.id,
            categoryId: sareeCategory.id,
            itemDescription: "Saree Blouse",
            quantity: 1,
            unitPrice: money(3500),
            lineTotal: money(3500),
            notes: "No block assigned yet.",
            tailorNote: "Wait for measurement.",
            status: OrderItemStatus.PENDING,
            createdById: users.staffUser.id,
            updatedById: users.staffUser.id,
          },
        ],
      },
    },
  });

  console.log("💰 Creating payments...");

  const paymentOne = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      paymentNumber: "PAY-00001",
      orderId: individualOrder.id,
      customerId: dinesha.id,
      paymentCategory: PaymentCategory.ADVANCE,
      paymentMethod: PaymentMethod.CASH,
      paidAmount: money(4000),
      totalAmount: money(9000),
      advanceAmount: money(4000),
      balanceAmount: money(5000),
      courierCharges: money(0),
      paymentDate: date("2026-04-26T08:45:00.000Z"),
      paymentTime: "08:45",
      status: PaymentRecordStatus.COMPLETED,
      orderNoSnapshot: "ORD-00001",
      customerNameSnapshot: "Dinesha Shamali",
      hospitalSnapshot: "Horana Hospital",
      townSnapshot: "Pasgoda",
      customerAddressSnapshot: "No 12, Main Street, Pasgoda",
      categorySnapshot: "Uniform",
      unitSnapshot: "Nurse Uniform - White",
      qtySnapshot: 2,
      specialNotes: "Advance received at shop.",
      createdById: users.staffUser.id,
      updatedById: users.staffUser.id,
    },
  });

  const paymentTwo = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      paymentNumber: "PAY-00002",
      orderId: groupMemberOrderOne.id,
      groupOrderId: groupOrder.id,
      customerId: kaveesha.id,
      paymentCategory: PaymentCategory.ADVANCE,
      paymentMethod: PaymentMethod.ONLINE_TRANSFER,
      paidAmount: money(6000),
      totalAmount: money(13500),
      advanceAmount: money(6000),
      balanceAmount: money(7500),
      courierCharges: money(250),
      onlineTransfer: true,
      bankName: "Commercial Bank",
      bankReference: "COMB-APR-0002",
      transactionNo: "TXN-HELORA-0002",
      paymentDate: date("2026-04-27T12:15:00.000Z"),
      paymentTime: "12:15",
      status: PaymentRecordStatus.COMPLETED,
      orderNoSnapshot: "ORD-00002",
      customerNameSnapshot: "Kaveesha Perera",
      hospitalSnapshot: "Horana Hospital",
      townSnapshot: "Kalutara",
      customerAddressSnapshot: "Station Road, Kalutara",
      categorySnapshot: "Uniform",
      unitSnapshot: "Nurse Uniform - White",
      qtySnapshot: 3,
      specialNotes: "Online transfer screenshot received.",
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
    },
  });

  await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      paymentNumber: "PAY-00003",
      groupOrderId: groupOrder.id,
      customerId: dinesha.id,
      paymentCategory: PaymentCategory.COURIER,
      paymentMethod: PaymentMethod.CASH,
      paidAmount: money(500),
      totalAmount: money(22500),
      advanceAmount: money(10000),
      balanceAmount: money(12500),
      courierCharges: money(500),
      paymentDate: date("2026-04-27T13:30:00.000Z"),
      paymentTime: "13:30",
      status: PaymentRecordStatus.COMPLETED,
      orderNoSnapshot: "GRP-00001",
      customerNameSnapshot: "Dinesha Shamali",
      hospitalSnapshot: "Horana Hospital",
      townSnapshot: "Horana",
      categorySnapshot: "Uniform",
      unitSnapshot: "Group delivery",
      qtySnapshot: 5,
      specialNotes: "Courier payment for group order.",
      createdById: users.adminUser.id,
      updatedById: users.adminUser.id,
    },
  });

  console.log("👷 Creating employees and attendance...");

  const tailorOne = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      employeeNumber: "EMP-0001",
      fullName: "Sunil Jayasinghe",
      phoneNumber: "0711112222",
      nicNumber: "198512345678",
      designation: "Senior Tailor",
      department: "Tailoring",
      joinedDate: date("2024-01-15T00:00:00.000Z"),
      biometricUserId: "BIO-001",
      basicSalary: money(65000),
      dailyWage: money(2500),
      hourlyRate: money(350),
      isActive: true,
      notes: "Handles hospital uniform cutting.",
      createdById: users.adminUser.id,
      updatedById: users.adminUser.id,
    },
  });

  const tailorTwo = await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      employeeNumber: "EMP-0002",
      fullName: "Malkanthi Perera",
      phoneNumber: "0723334444",
      nicNumber: "199012345678",
      designation: "Machine Operator",
      department: "Sewing",
      joinedDate: date("2024-06-01T00:00:00.000Z"),
      biometricUserId: "BIO-002",
      basicSalary: money(52000),
      dailyWage: money(2000),
      hourlyRate: money(300),
      isActive: true,
      notes: "Sewing line operator.",
      createdById: users.managerUser.id,
      updatedById: users.managerUser.id,
    },
  });

  const attendanceDevice = await prisma.attendanceDevice.create({
    data: {
      tenantId: tenant.id,
      deviceName: "Main Factory Fingerprint Device",
      deviceCode: "DEV-001",
      deviceType: AttendanceDeviceType.FINGERPRINT,
      syncMode: AttendanceSyncMode.CSV_IMPORT,
      serialNumber: "ZK-HELORA-001",
      ipAddress: "192.168.1.25",
      port: 4370,
      location: "Factory Entrance",
      isActive: true,
      lastSyncedAt: date("2026-04-30T18:00:00.000Z"),
      notes: "Demo attendance device.",
    },
  });

  await prisma.attendanceLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        employeeId: tailorOne.id,
        deviceId: attendanceDevice.id,
        biometricUserId: "BIO-001",
        punchTime: date("2026-04-30T08:04:00.000Z"),
        punchType: AttendancePunchType.CHECK_IN,
        verifyMode: AttendanceVerifyMode.FINGERPRINT,
        rawPayload: {
          deviceCode: "DEV-001",
          source: "seed",
        },
        isProcessed: true,
        processedAt: date("2026-04-30T18:00:00.000Z"),
      },
      {
        tenantId: tenant.id,
        employeeId: tailorOne.id,
        deviceId: attendanceDevice.id,
        biometricUserId: "BIO-001",
        punchTime: date("2026-04-30T17:12:00.000Z"),
        punchType: AttendancePunchType.CHECK_OUT,
        verifyMode: AttendanceVerifyMode.FINGERPRINT,
        rawPayload: {
          deviceCode: "DEV-001",
          source: "seed",
        },
        isProcessed: true,
        processedAt: date("2026-04-30T18:00:00.000Z"),
      },
      {
        tenantId: tenant.id,
        employeeId: tailorTwo.id,
        deviceId: attendanceDevice.id,
        biometricUserId: "BIO-002",
        punchTime: date("2026-04-30T08:35:00.000Z"),
        punchType: AttendancePunchType.CHECK_IN,
        verifyMode: AttendanceVerifyMode.FINGERPRINT,
        rawPayload: {
          deviceCode: "DEV-001",
          source: "seed",
        },
        isProcessed: true,
        processedAt: date("2026-04-30T18:00:00.000Z"),
      },
    ],
  });

  await prisma.attendanceRecord.createMany({
    data: [
      {
        tenantId: tenant.id,
        employeeId: tailorOne.id,
        attendanceDate: date("2026-04-30T00:00:00.000Z"),
        firstIn: date("2026-04-30T08:04:00.000Z"),
        lastOut: date("2026-04-30T17:12:00.000Z"),
        status: AttendanceRecordStatus.PRESENT,
        source: AttendanceRecordSource.DEVICE,
        totalMinutes: 548,
        lateMinutes: 4,
        overtimeMinutes: 12,
        expectedInTime: "08:00",
        expectedOutTime: "17:00",
        notes: "Normal working day.",
        approvedById: users.managerUser.id,
        approvedAt: date("2026-04-30T18:10:00.000Z"),
        createdById: users.managerUser.id,
        updatedById: users.managerUser.id,
      },
      {
        tenantId: tenant.id,
        employeeId: tailorTwo.id,
        attendanceDate: date("2026-04-30T00:00:00.000Z"),
        firstIn: date("2026-04-30T08:35:00.000Z"),
        status: AttendanceRecordStatus.LATE,
        source: AttendanceRecordSource.DEVICE,
        totalMinutes: 0,
        lateMinutes: 35,
        overtimeMinutes: 0,
        expectedInTime: "08:00",
        expectedOutTime: "17:00",
        notes: "Missing checkout punch.",
        createdById: users.managerUser.id,
        updatedById: users.managerUser.id,
      },
    ],
  });

  console.log("💬 Creating WhatsApp demo data...");

  const whatsappAccount = await prisma.whatsappAccount.create({
    data: {
      tenantId: tenant.id,
      businessName: "New Deepani Garment",
      phoneNumber: "94770000000",
      phoneNumberId: "demo_phone_number_id",
      businessAccountId: "demo_business_account_id",
      accessToken: "demo_access_token_replace_in_real_env",
      webhookVerifyToken: "helora_demo_verify_token",
      isActive: true,
    },
  });

  const orderReadyTemplate = await prisma.whatsappTemplate.create({
    data: {
      tenantId: tenant.id,
      whatsappAccountId: whatsappAccount.id,
      name: "order_ready_notification",
      category: WhatsappTemplateCategory.UTILITY,
      languageCode: "en",
      status: WhatsappTemplateStatus.APPROVED,
      description: "Notify customer when order is ready.",
      bodyPreview:
        "Hello {{1}}, your order {{2}} is ready for collection.",
    },
  });

  await prisma.whatsappTemplate.create({
    data: {
      tenantId: tenant.id,
      whatsappAccountId: whatsappAccount.id,
      name: "payment_received_notification",
      category: WhatsappTemplateCategory.UTILITY,
      languageCode: "en",
      status: WhatsappTemplateStatus.APPROVED,
      description: "Notify customer after payment is recorded.",
      bodyPreview:
        "Hello {{1}}, we received your payment of {{2}} for order {{3}}.",
    },
  });

  await prisma.whatsappMessage.createMany({
    data: [
      {
        tenantId: tenant.id,
        whatsappAccountId: whatsappAccount.id,
        customerId: dinesha.id,
        orderId: individualOrder.id,
        paymentId: paymentOne.id,
        direction: WhatsappMessageDirection.OUTBOUND,
        messageType: WhatsappMessageType.TEMPLATE,
        status: WhatsappMessageStatus.DELIVERED,
        whatsappMessageId: "wamid.demo.0001",
        fromPhone: "94770000000",
        toPhone: "94718370292",
        templateName: orderReadyTemplate.name,
        languageCode: "en",
        body: "Hello Dinesha, your order ORD-00001 is confirmed.",
        payload: {
          orderNumber: "ORD-00001",
          template: orderReadyTemplate.name,
        },
        sentAt: date("2026-04-26T09:00:00.000Z"),
        deliveredAt: date("2026-04-26T09:01:00.000Z"),
      },
      {
        tenantId: tenant.id,
        whatsappAccountId: whatsappAccount.id,
        customerId: kaveesha.id,
        orderId: groupMemberOrderOne.id,
        groupOrderId: groupOrder.id,
        paymentId: paymentTwo.id,
        direction: WhatsappMessageDirection.OUTBOUND,
        messageType: WhatsappMessageType.TEXT,
        status: WhatsappMessageStatus.SENT,
        whatsappMessageId: "wamid.demo.0002",
        fromPhone: "94770000000",
        toPhone: "94714567890",
        body: "Your Horana Hospital group order has been added.",
        payload: {
          groupOrderNumber: "GRP-00001",
          orderNumber: "ORD-00002",
        },
        sentAt: date("2026-04-27T12:30:00.000Z"),
      },
      {
        tenantId: tenant.id,
        whatsappAccountId: whatsappAccount.id,
        customerId: dinesha.id,
        groupOrderId: groupOrder.id,
        direction: WhatsappMessageDirection.INBOUND,
        messageType: WhatsappMessageType.TEXT,
        status: WhatsappMessageStatus.RECEIVED,
        whatsappMessageId: "wamid.demo.0003",
        fromPhone: "94718370292",
        toPhone: "94770000000",
        body: "Please deliver all uniforms together.",
        payload: {
          source: "customer",
        },
        sentAt: date("2026-04-27T13:00:00.000Z"),
      },
    ],
  });

  console.log("📝 Creating audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        actorUserId: users.adminUser.id,
        action: AuditAction.CREATE,
        entityType: "Tenant",
        entityId: tenant.id,
        path: "/seed",
        method: "SEED",
        metadata: {
          message: "Demo tenant created by seed.",
        },
      },
      {
        tenantId: tenant.id,
        actorUserId: users.staffUser.id,
        action: AuditAction.CREATE,
        entityType: "Order",
        entityId: individualOrder.id,
        path: "/seed/orders",
        method: "SEED",
        metadata: {
          orderNumber: "ORD-00001",
        },
      },
      {
        tenantId: tenant.id,
        actorUserId: users.managerUser.id,
        action: AuditAction.UPDATE,
        entityType: "Measurement",
        entityId: dineshaUniformMeasurement.id,
        path: "/seed/measurements",
        method: "SEED",
        metadata: {
          measurementNumber: "MES-00001",
          verificationStatus: "VERIFIED_OK",
        },
      },
    ],
  });

  console.log("✅ Seed completed successfully.");
  console.log("");
  console.log("Demo tenant:");
  console.log(`  slug: ${tenant.slug}`);
  console.log("");
  console.log("Demo users:");
  console.log("  admin@helora.local");
  console.log("  manager@helora.local");
  console.log("  staff@helora.local");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });