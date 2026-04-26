/*
  Warnings:

  - The values [DRAFT] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blockNo` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `town` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `groupOrderNo` on the `GroupOrder` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Measurement` table. All the data in the column will be lost.
  - You are about to drop the column `measurementNo` on the `Measurement` table. All the data in the column will be lost.
  - You are about to drop the column `values` on the `Measurement` table. All the data in the column will be lost.
  - You are about to drop the column `expectedDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderNo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderNote` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemNote` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `paymentNo` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId,blockNumber,categoryId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,groupOrderNumber]` on the table `GroupOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,measurementNumber]` on the table `Measurement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,paymentNumber]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockNumber` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupOrderNumber` to the `GroupOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Measurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemDescription` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentNumber` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE');

-- CreateEnum
CREATE TYPE "MeasurementFieldInputType" AS ENUM ('TEXT', 'NUMBER', 'DECIMAL', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MeasurementVerificationStatus" AS ENUM ('NOT_VERIFIED', 'VERIFIED_OK', 'NEEDS_UPDATE', 'UPDATED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('PHYSICAL_SHOP', 'PHONE_CALL', 'WHATSAPP', 'ONLINE');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CUTTING', 'SEWING', 'READY', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_customerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropIndex
DROP INDEX "Block_blockNo_idx";

-- DropIndex
DROP INDEX "Block_category_idx";

-- DropIndex
DROP INDEX "Block_customerId_idx";

-- DropIndex
DROP INDEX "Block_tenantId_blockNo_category_key";

-- DropIndex
DROP INDEX "GroupOrder_groupOrderNo_idx";

-- DropIndex
DROP INDEX "GroupOrder_tenantId_groupOrderNo_key";

-- DropIndex
DROP INDEX "Measurement_category_idx";

-- DropIndex
DROP INDEX "Order_orderNo_idx";

-- DropIndex
DROP INDEX "Order_tenantId_orderNo_key";

-- DropIndex
DROP INDEX "OrderItem_category_idx";

-- DropIndex
DROP INDEX "OrderItem_tenantId_idx";

-- DropIndex
DROP INDEX "Payment_paymentNo_idx";

-- DropIndex
DROP INDEX "Payment_tenantId_paymentNo_key";

-- DropIndex
DROP INDEX "Tenant_code_idx";

-- DropIndex
DROP INDEX "Tenant_code_key";

-- DropIndex
DROP INDEX "User_tenantId_email_key";

-- DropIndex
DROP INDEX "User_tenantId_idx";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "blockNo",
DROP COLUMN "category",
DROP COLUMN "customerId",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "town",
ADD COLUMN     "blockNumber" TEXT NOT NULL,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fitNotes" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "legacyId" INTEGER,
ADD COLUMN     "previousBlockId" TEXT,
ADD COLUMN     "readyMadeSize" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "sizeLabel" TEXT,
ADD COLUMN     "status" "BlockStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "versionNo" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GroupOrder" DROP COLUMN "groupOrderNo",
ADD COLUMN     "groupOrderNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "category",
DROP COLUMN "measurementNo",
DROP COLUMN "values",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "measurementNumber" TEXT,
ADD COLUMN     "previousMeasurementId" TEXT,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationStatus" "MeasurementVerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT,
ADD COLUMN     "versionNo" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "expectedDate",
DROP COLUMN "orderNo",
DROP COLUMN "orderNote",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "orderSource" "OrderSource" NOT NULL DEFAULT 'PHYSICAL_SHOP',
ADD COLUMN     "promisedDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "category",
DROP COLUMN "itemName",
DROP COLUMN "itemNote",
DROP COLUMN "qty",
DROP COLUMN "tenantId",
DROP COLUMN "totalPrice",
DROP COLUMN "unit",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "itemDescription" TEXT NOT NULL,
ADD COLUMN     "lineTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentNo",
ADD COLUMN     "paymentNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "code",
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "tenantId",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BlockCategory";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementField" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inputType" "MeasurementFieldInputType" NOT NULL DEFAULT 'TEXT',
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "helpText" TEXT,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerBlock" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementValue" (
    "id" TEXT NOT NULL,
    "measurementId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT,
    "numericValue" DECIMAL(10,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeasurementValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_idx" ON "Membership"("tenantId");

-- CreateIndex
CREATE INDEX "Membership_roleId_idx" ON "Membership"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_tenantId_key" ON "Membership"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_key" ON "Permission"("resource", "action");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "Category_tenantId_idx" ON "Category"("tenantId");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "Category"("tenantId", "name");

-- CreateIndex
CREATE INDEX "MeasurementField_tenantId_idx" ON "MeasurementField"("tenantId");

-- CreateIndex
CREATE INDEX "MeasurementField_categoryId_idx" ON "MeasurementField"("categoryId");

-- CreateIndex
CREATE INDEX "MeasurementField_code_idx" ON "MeasurementField"("code");

-- CreateIndex
CREATE INDEX "MeasurementField_isActive_idx" ON "MeasurementField"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementField_categoryId_code_key" ON "MeasurementField"("categoryId", "code");

-- CreateIndex
CREATE INDEX "CustomerBlock_tenantId_idx" ON "CustomerBlock"("tenantId");

-- CreateIndex
CREATE INDEX "CustomerBlock_customerId_idx" ON "CustomerBlock"("customerId");

-- CreateIndex
CREATE INDEX "CustomerBlock_blockId_idx" ON "CustomerBlock"("blockId");

-- CreateIndex
CREATE INDEX "CustomerBlock_isDefault_idx" ON "CustomerBlock"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBlock_customerId_blockId_key" ON "CustomerBlock"("customerId", "blockId");

-- CreateIndex
CREATE INDEX "MeasurementValue_measurementId_idx" ON "MeasurementValue"("measurementId");

-- CreateIndex
CREATE INDEX "MeasurementValue_fieldId_idx" ON "MeasurementValue"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementValue_measurementId_fieldId_key" ON "MeasurementValue"("measurementId", "fieldId");

-- CreateIndex
CREATE INDEX "Block_categoryId_idx" ON "Block"("categoryId");

-- CreateIndex
CREATE INDEX "Block_blockNumber_idx" ON "Block"("blockNumber");

-- CreateIndex
CREATE INDEX "Block_status_idx" ON "Block"("status");

-- CreateIndex
CREATE INDEX "Block_legacyId_idx" ON "Block"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_tenantId_blockNumber_categoryId_key" ON "Block"("tenantId", "blockNumber", "categoryId");

-- CreateIndex
CREATE INDEX "Customer_alternatePhone_idx" ON "Customer"("alternatePhone");

-- CreateIndex
CREATE INDEX "GroupOrder_groupOrderNumber_idx" ON "GroupOrder"("groupOrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GroupOrder_tenantId_groupOrderNumber_key" ON "GroupOrder"("tenantId", "groupOrderNumber");

-- CreateIndex
CREATE INDEX "Measurement_categoryId_idx" ON "Measurement"("categoryId");

-- CreateIndex
CREATE INDEX "Measurement_verificationStatus_idx" ON "Measurement"("verificationStatus");

-- CreateIndex
CREATE INDEX "Measurement_measurementNumber_idx" ON "Measurement"("measurementNumber");

-- CreateIndex
CREATE INDEX "Measurement_previousMeasurementId_idx" ON "Measurement"("previousMeasurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_tenantId_measurementNumber_key" ON "Measurement"("tenantId", "measurementNumber");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNumber_key" ON "Order"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "OrderItem_categoryId_idx" ON "OrderItem"("categoryId");

-- CreateIndex
CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tenantId_paymentNumber_key" ON "Payment"("tenantId", "paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementField" ADD CONSTRAINT "MeasurementField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementField" ADD CONSTRAINT "MeasurementField_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_previousBlockId_fkey" FOREIGN KEY ("previousBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_previousMeasurementId_fkey" FOREIGN KEY ("previousMeasurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementValue" ADD CONSTRAINT "MeasurementValue_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementValue" ADD CONSTRAINT "MeasurementValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "MeasurementField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
