-- CreateEnum
CREATE TYPE "AttendanceDeviceType" AS ENUM ('FINGERPRINT', 'FACE', 'CARD', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceSyncMode" AS ENUM ('MANUAL', 'PUSH', 'PULL', 'CLOUD', 'CSV_IMPORT');

-- CreateEnum
CREATE TYPE "AttendancePunchType" AS ENUM ('CHECK_IN', 'CHECK_OUT', 'BREAK_IN', 'BREAK_OUT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AttendanceVerifyMode" AS ENUM ('FINGERPRINT', 'FACE', 'CARD', 'PIN', 'MANUAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AttendanceRecordStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE', 'HOLIDAY', 'OFF_DAY');

-- CreateEnum
CREATE TYPE "AttendanceRecordSource" AS ENUM ('DEVICE', 'MANUAL', 'IMPORT', 'SYSTEM');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "nicNumber" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "joinedDate" TIMESTAMP(3),
    "resignedDate" TIMESTAMP(3),
    "biometricUserId" TEXT,
    "basicSalary" DECIMAL(12,2),
    "dailyWage" DECIMAL(12,2),
    "hourlyRate" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceDevice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "deviceType" "AttendanceDeviceType" NOT NULL DEFAULT 'FINGERPRINT',
    "syncMode" "AttendanceSyncMode" NOT NULL DEFAULT 'MANUAL',
    "serialNumber" TEXT,
    "ipAddress" TEXT,
    "port" INTEGER,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "deviceId" TEXT,
    "biometricUserId" TEXT NOT NULL,
    "punchTime" TIMESTAMP(3) NOT NULL,
    "punchType" "AttendancePunchType" NOT NULL DEFAULT 'UNKNOWN',
    "verifyMode" "AttendanceVerifyMode" NOT NULL DEFAULT 'UNKNOWN',
    "rawPayload" JSONB,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "attendanceDate" TIMESTAMP(3) NOT NULL,
    "firstIn" TIMESTAMP(3),
    "lastOut" TIMESTAMP(3),
    "status" "AttendanceRecordStatus" NOT NULL DEFAULT 'PRESENT',
    "source" "AttendanceRecordSource" NOT NULL DEFAULT 'DEVICE',
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "expectedInTime" TEXT,
    "expectedOutTime" TEXT,
    "notes" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE INDEX "Employee_employeeNumber_idx" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "Employee_biometricUserId_idx" ON "Employee"("biometricUserId");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_isActive_idx" ON "Employee"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_employeeNumber_key" ON "Employee"("tenantId", "employeeNumber");

-- CreateIndex
CREATE INDEX "AttendanceDevice_tenantId_idx" ON "AttendanceDevice"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceDevice_deviceCode_idx" ON "AttendanceDevice"("deviceCode");

-- CreateIndex
CREATE INDEX "AttendanceDevice_deviceType_idx" ON "AttendanceDevice"("deviceType");

-- CreateIndex
CREATE INDEX "AttendanceDevice_syncMode_idx" ON "AttendanceDevice"("syncMode");

-- CreateIndex
CREATE INDEX "AttendanceDevice_isActive_idx" ON "AttendanceDevice"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDevice_tenantId_deviceCode_key" ON "AttendanceDevice"("tenantId", "deviceCode");

-- CreateIndex
CREATE INDEX "AttendanceLog_tenantId_idx" ON "AttendanceLog"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceLog_employeeId_idx" ON "AttendanceLog"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceLog_deviceId_idx" ON "AttendanceLog"("deviceId");

-- CreateIndex
CREATE INDEX "AttendanceLog_biometricUserId_idx" ON "AttendanceLog"("biometricUserId");

-- CreateIndex
CREATE INDEX "AttendanceLog_punchTime_idx" ON "AttendanceLog"("punchTime");

-- CreateIndex
CREATE INDEX "AttendanceLog_punchType_idx" ON "AttendanceLog"("punchType");

-- CreateIndex
CREATE INDEX "AttendanceLog_isProcessed_idx" ON "AttendanceLog"("isProcessed");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLog_tenantId_biometricUserId_punchTime_key" ON "AttendanceLog"("tenantId", "biometricUserId", "punchTime");

-- CreateIndex
CREATE INDEX "AttendanceRecord_tenantId_idx" ON "AttendanceRecord"("tenantId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_employeeId_idx" ON "AttendanceRecord"("employeeId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_attendanceDate_idx" ON "AttendanceRecord"("attendanceDate");

-- CreateIndex
CREATE INDEX "AttendanceRecord_status_idx" ON "AttendanceRecord"("status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_source_idx" ON "AttendanceRecord"("source");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_tenantId_employeeId_attendanceDate_key" ON "AttendanceRecord"("tenantId", "employeeId", "attendanceDate");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceDevice" ADD CONSTRAINT "AttendanceDevice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AttendanceDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
