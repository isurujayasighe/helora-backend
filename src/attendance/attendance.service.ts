import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AttendanceDeviceType,
  AttendancePunchType,
  AttendanceRecordSource,
  AttendanceRecordStatus,
  AttendanceSyncMode,
  AttendanceVerifyMode,
  AuditAction,
  Prisma,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDeviceDto } from './dto/create-attendance-device.dto';
import { ImportAttendanceLogsDto } from './dto/import-attendance-logs.dto';
import { ManualAttendanceRecordDto } from './dto/manual-attendance-record.dto';
import { UpdateAttendanceDeviceDto } from './dto/update-attendance-device.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createDevice(params: CreateAttendanceDeviceDto & { tenantId: string; actorUserId: string }) {
    const device = await this.prisma.attendanceDevice.create({
      data: {
        tenantId: params.tenantId,
        deviceName: params.deviceName.trim(),
        deviceCode: params.deviceCode.trim(),
        deviceType: params.deviceType ?? AttendanceDeviceType.FINGERPRINT,
        syncMode: params.syncMode ?? AttendanceSyncMode.MANUAL,
        serialNumber: this.clean(params.serialNumber),
        ipAddress: this.clean(params.ipAddress),
        port: params.port,
        location: this.clean(params.location),
        isActive: params.isActive ?? true,
        notes: this.clean(params.notes),
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.CREATE,
      entityType: 'attendance_device',
      entityId: device.id,
      metadata: { deviceCode: device.deviceCode, deviceName: device.deviceName },
    });

    return device;
  }

  async updateDevice(params: UpdateAttendanceDeviceDto & { id: string; tenantId: string; actorUserId: string }) {
    const existing = await this.prisma.attendanceDevice.findFirst({
      where: { id: params.id, tenantId: params.tenantId },
      select: { id: true },
    });

    if (!existing) throw new NotFoundException('Attendance device not found.');

    const device = await this.prisma.attendanceDevice.update({
      where: { id: params.id },
      data: {
        deviceName: params.deviceName?.trim(),
        deviceCode: params.deviceCode?.trim(),
        deviceType: params.deviceType,
        syncMode: params.syncMode,
        serialNumber: params.serialNumber === undefined ? undefined : this.clean(params.serialNumber),
        ipAddress: params.ipAddress === undefined ? undefined : this.clean(params.ipAddress),
        port: params.port,
        location: params.location === undefined ? undefined : this.clean(params.location),
        isActive: params.isActive,
        notes: params.notes === undefined ? undefined : this.clean(params.notes),
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'attendance_device',
      entityId: device.id,
      metadata: { deviceCode: device.deviceCode, deviceName: device.deviceName },
    });

    return device;
  }

  async listDevices(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    deviceType?: AttendanceDeviceType;
    syncMode?: AttendanceSyncMode;
    isActive?: boolean;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const search = params.search?.trim();

    const where: Prisma.AttendanceDeviceWhereInput = {
      tenantId: params.tenantId,
      deviceType: params.deviceType,
      syncMode: params.syncMode,
      isActive: params.isActive,
      OR: search
        ? [
            { deviceName: { contains: search, mode: 'insensitive' } },
            { deviceCode: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.attendanceDevice.findMany({
        where,
        include: { _count: { select: { attendanceLogs: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.attendanceDevice.count({ where }),
    ]);

    return this.paginate(items, totalItems, page, pageSize);
  }

  async importLogs(
  params: ImportAttendanceLogsDto & {
    tenantId: string;
    actorUserId: string;
  },
) {
  if (!params.logs?.length) {
    throw new BadRequestException('At least one attendance log is required.');
  }

  if (params.deviceId) {
    const device = await this.prisma.attendanceDevice.findFirst({
      where: {
        id: params.deviceId,
        tenantId: params.tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Attendance device not found.');
    }
  }

  let importedCount = 0;
  const unmatchedBiometricIds = new Set<string>();

  for (const log of params.logs) {
    const punchTime = new Date(log.punchTime);

    if (Number.isNaN(punchTime.getTime())) {
      throw new BadRequestException(
        `Invalid punch time for biometric user ${log.biometricUserId}.`,
      );
    }

    const employee = log.employeeId
      ? await this.prisma.employee.findFirst({
          where: {
            id: log.employeeId,
            tenantId: params.tenantId,
          },
          select: {
            id: true,
          },
        })
      : await this.prisma.employee.findFirst({
          where: {
            tenantId: params.tenantId,
            biometricUserId: log.biometricUserId,
          },
          select: {
            id: true,
          },
        });

    if (!employee) {
      unmatchedBiometricIds.add(log.biometricUserId);
    }

    const rawPayload =
      log.rawPayload === undefined || log.rawPayload === null
        ? Prisma.JsonNull
        : (log.rawPayload as Prisma.InputJsonValue);

    await this.prisma.attendanceLog.upsert({
      where: {
        tenantId_biometricUserId_punchTime: {
          tenantId: params.tenantId,
          biometricUserId: log.biometricUserId,
          punchTime,
        },
      },
      update: {
        employeeId: employee?.id,
        deviceId: params.deviceId,
        punchType: log.punchType ?? AttendancePunchType.UNKNOWN,
        verifyMode: log.verifyMode ?? AttendanceVerifyMode.UNKNOWN,
        rawPayload,
      },
      create: {
        tenantId: params.tenantId,
        employeeId: employee?.id,
        deviceId: params.deviceId,
        biometricUserId: log.biometricUserId,
        punchTime,
        punchType: log.punchType ?? AttendancePunchType.UNKNOWN,
        verifyMode: log.verifyMode ?? AttendanceVerifyMode.UNKNOWN,
        rawPayload,
      },
    });

    importedCount += 1;
  }

  if (params.deviceId) {
    await this.prisma.attendanceDevice.update({
      where: {
        id: params.deviceId,
      },
      data: {
        lastSyncedAt: new Date(),
      },
    });
  }

  await this.auditService.log({
    tenantId: params.tenantId,
    actorUserId: params.actorUserId,
    action: AuditAction.CREATE,
    entityType: 'attendance_log',
    metadata: {
      importedCount,
      unmatchedBiometricIds: [...unmatchedBiometricIds],
      deviceId: params.deviceId,
    },
  });

  return {
    importedCount,
    unmatchedBiometricIds: [...unmatchedBiometricIds],
  };
}

  async listLogs(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    employeeId?: string;
    deviceId?: string;
    biometricUserId?: string;
    punchType?: AttendancePunchType;
    isProcessed?: boolean;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.AttendanceLogWhereInput = {
      tenantId: params.tenantId,
      employeeId: params.employeeId || undefined,
      deviceId: params.deviceId || undefined,
      biometricUserId: params.biometricUserId || undefined,
      punchType: params.punchType,
      isProcessed: params.isProcessed,
      punchTime:
        params.fromDate || params.toDate
          ? {
              gte: params.fromDate ? new Date(params.fromDate) : undefined,
              lte: params.toDate ? new Date(params.toDate) : undefined,
            }
          : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.attendanceLog.findMany({
        where,
        include: {
          employee: {
            select: { id: true, employeeNumber: true, fullName: true, department: true },
          },
          device: {
            select: { id: true, deviceName: true, deviceCode: true },
          },
        },
        orderBy: { punchTime: 'desc' },
        skip,
        take,
      }),
      this.prisma.attendanceLog.count({ where }),
    ]);

    return this.paginate(items, totalItems, page, pageSize);
  }

  async listRecords(params: {
    tenantId: string;
    page?: number;
    pageSize?: number;
    employeeId?: string;
    status?: AttendanceRecordStatus;
    source?: AttendanceRecordSource;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.AttendanceRecordWhereInput = {
      tenantId: params.tenantId,
      employeeId: params.employeeId || undefined,
      status: params.status,
      source: params.source,
      attendanceDate:
        params.fromDate || params.toDate
          ? {
              gte: params.fromDate ? new Date(params.fromDate) : undefined,
              lte: params.toDate ? new Date(params.toDate) : undefined,
            }
          : undefined,
    };

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.findMany({
        where,
        include: {
          employee: {
            select: { id: true, employeeNumber: true, fullName: true, department: true, designation: true },
          },
          approvedBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: [{ attendanceDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return this.paginate(items, totalItems, page, pageSize);
  }

  async upsertManualRecord(params: ManualAttendanceRecordDto & { tenantId: string; actorUserId: string }) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: params.employeeId, tenantId: params.tenantId },
      select: { id: true },
    });

    if (!employee) throw new NotFoundException('Employee not found.');

    const attendanceDate = this.startOfDay(new Date(params.attendanceDate));

    const record = await this.prisma.attendanceRecord.upsert({
      where: {
        tenantId_employeeId_attendanceDate: {
          tenantId: params.tenantId,
          employeeId: params.employeeId,
          attendanceDate,
        },
      },
      update: {
        firstIn: params.firstIn === undefined ? undefined : params.firstIn ? new Date(params.firstIn) : null,
        lastOut: params.lastOut === undefined ? undefined : params.lastOut ? new Date(params.lastOut) : null,
        status: params.status ?? AttendanceRecordStatus.PRESENT,
        source: params.source ?? AttendanceRecordSource.MANUAL,
        totalMinutes: params.totalMinutes,
        lateMinutes: params.lateMinutes,
        overtimeMinutes: params.overtimeMinutes,
        expectedInTime: params.expectedInTime,
        expectedOutTime: params.expectedOutTime,
        notes: this.clean(params.notes),
        updatedById: params.actorUserId,
      },
      create: {
        tenantId: params.tenantId,
        employeeId: params.employeeId,
        attendanceDate,
        firstIn: params.firstIn ? new Date(params.firstIn) : undefined,
        lastOut: params.lastOut ? new Date(params.lastOut) : undefined,
        status: params.status ?? AttendanceRecordStatus.PRESENT,
        source: params.source ?? AttendanceRecordSource.MANUAL,
        totalMinutes: params.totalMinutes ?? this.calculateMinutes(params.firstIn, params.lastOut),
        lateMinutes: params.lateMinutes ?? 0,
        overtimeMinutes: params.overtimeMinutes ?? 0,
        expectedInTime: params.expectedInTime,
        expectedOutTime: params.expectedOutTime,
        notes: this.clean(params.notes),
        createdById: params.actorUserId,
        updatedById: params.actorUserId,
      },
      include: {
        employee: { select: { id: true, employeeNumber: true, fullName: true, department: true } },
      },
    });

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'attendance_record',
      entityId: record.id,
      metadata: { employeeId: params.employeeId, attendanceDate },
    });

    return record;
  }

  async processAttendanceDate(params: { tenantId: string; actorUserId: string; attendanceDate: string }) {
    const dayStart = this.startOfDay(new Date(params.attendanceDate));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const logs = await this.prisma.attendanceLog.findMany({
      where: {
        tenantId: params.tenantId,
        employeeId: { not: null },
        punchTime: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { punchTime: 'asc' },
    });

    const logsByEmployee = new Map<string, typeof logs>();

    for (const log of logs) {
      if (!log.employeeId) continue;
      logsByEmployee.set(log.employeeId, [...(logsByEmployee.get(log.employeeId) ?? []), log]);
    }

    let processedRecords = 0;

    for (const [employeeId, employeeLogs] of logsByEmployee.entries()) {
      const firstIn = employeeLogs[0]?.punchTime;
      const lastOut = employeeLogs.length > 1 ? employeeLogs[employeeLogs.length - 1].punchTime : null;
      const totalMinutes =
        firstIn && lastOut ? Math.max(0, Math.floor((lastOut.getTime() - firstIn.getTime()) / 60000)) : 0;
      const lateMinutes = this.calculateLateMinutes(firstIn, '09:00');
      const overtimeMinutes = Math.max(0, totalMinutes - 480);
      const status = lateMinutes > 0 ? AttendanceRecordStatus.LATE : AttendanceRecordStatus.PRESENT;

      await this.prisma.attendanceRecord.upsert({
        where: {
          tenantId_employeeId_attendanceDate: {
            tenantId: params.tenantId,
            employeeId,
            attendanceDate: dayStart,
          },
        },
        update: {
          firstIn,
          lastOut,
          totalMinutes,
          lateMinutes,
          overtimeMinutes,
          status,
          source: AttendanceRecordSource.DEVICE,
          expectedInTime: '09:00',
          expectedOutTime: '17:00',
          notes: 'Processed from attendance logs.',
          updatedById: params.actorUserId,
        },
        create: {
          tenantId: params.tenantId,
          employeeId,
          attendanceDate: dayStart,
          firstIn,
          lastOut,
          totalMinutes,
          lateMinutes,
          overtimeMinutes,
          status,
          source: AttendanceRecordSource.DEVICE,
          expectedInTime: '09:00',
          expectedOutTime: '17:00',
          notes: 'Processed from attendance logs.',
          createdById: params.actorUserId,
          updatedById: params.actorUserId,
        },
      });

      await this.prisma.attendanceLog.updateMany({
        where: { id: { in: employeeLogs.map((item) => item.id) } },
        data: { isProcessed: true, processedAt: new Date() },
      });

      processedRecords += 1;
    }

    await this.auditService.log({
      tenantId: params.tenantId,
      actorUserId: params.actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'attendance_record',
      metadata: { attendanceDate: dayStart, processedRecords },
    });

    return { attendanceDate: dayStart, processedRecords, logCount: logs.length };
  }

  private calculateMinutes(firstIn?: string | null, lastOut?: string | null) {
    if (!firstIn || !lastOut) return 0;
    return Math.max(0, Math.floor((new Date(lastOut).getTime() - new Date(firstIn).getTime()) / 60000));
  }

  private calculateLateMinutes(firstIn?: Date | null, expectedInTime = '09:00') {
    if (!firstIn) return 0;
    const [hour, minute] = expectedInTime.split(':').map(Number);
    const expected = new Date(firstIn);
    expected.setHours(hour, minute, 0, 0);
    return Math.max(0, Math.floor((firstIn.getTime() - expected.getTime()) / 60000));
  }

  private startOfDay(date: Date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private paginate<T>(items: T[], totalItems: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private clean(value?: string | null) {
    const cleaned = value?.trim();
    return cleaned ? cleaned : undefined;
  }
}
