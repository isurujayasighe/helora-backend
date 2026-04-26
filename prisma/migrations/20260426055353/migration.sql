/*
  Warnings:

  - The values [BANK_TRANSFER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blockNumber` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `fitNotes` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `legacyId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `previousBlockId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `readyMadeSize` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `sizeLabel` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `versionNo` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderSource` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `promisedDate` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `categoryId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemDescription` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineTotal` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,blockNo,category]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,orderNo]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,paymentNo]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockNo` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNo` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `advanceAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `balanceAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitPrice` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `paymentNo` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CASHIER', 'TAILOR');

-- CreateEnum
CREATE TYPE "BlockCategory" AS ENUM ('SAREE', 'UNIFORM');

-- CreateEnum
CREATE TYPE "GroupOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('INDIVIDUAL', 'GROUP_MEMBER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CUTTING', 'SEWING', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'ADVANCE_PAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderPaymentMode" AS ENUM ('CASH', 'ONLINE_TRANSFER', 'BANK_DEPOSIT', 'CARD', 'MIXED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'CUTTING', 'SEWING', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentRecordStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentCategory" ADD VALUE 'COURIER';
ALTER TYPE "PaymentCategory" ADD VALUE 'REFUND';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'ONLINE_TRANSFER', 'BANK_DEPOSIT', 'CARD', 'OTHER');
ALTER TABLE "Payment" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_previousBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "CustomerBlock" DROP CONSTRAINT "CustomerBlock_blockId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerBlock" DROP CONSTRAINT "CustomerBlock_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Block_tenantId_blockNumber_categoryId_key";

-- DropIndex
DROP INDEX "Block_tenantId_categoryId_idx";

-- DropIndex
DROP INDEX "Block_tenantId_readyMadeSize_idx";

-- DropIndex
DROP INDEX "Order_tenantId_customerId_idx";

-- DropIndex
DROP INDEX "Order_tenantId_orderDate_idx";

-- DropIndex
DROP INDEX "Order_tenantId_orderNumber_key";

-- DropIndex
DROP INDEX "Order_tenantId_orderSource_idx";

-- DropIndex
DROP INDEX "Order_tenantId_promisedDate_idx";

-- DropIndex
DROP INDEX "OrderItem_categoryId_idx";

-- DropIndex
DROP INDEX "Tenant_slug_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "blockNumber",
DROP COLUMN "categoryId",
DROP COLUMN "description",
DROP COLUMN "fitNotes",
DROP COLUMN "lastUsedAt",
DROP COLUMN "legacyId",
DROP COLUMN "previousBlockId",
DROP COLUMN "readyMadeSize",
DROP COLUMN "remarks",
DROP COLUMN "sizeLabel",
DROP COLUMN "status",
DROP COLUMN "versionNo",
ADD COLUMN     "blockNo" TEXT NOT NULL,
ADD COLUMN     "category" "BlockCategory" NOT NULL,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "town" TEXT,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "hospitalName" TEXT,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "notes",
DROP COLUMN "orderNumber",
DROP COLUMN "orderSource",
DROP COLUMN "promisedDate",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "courierCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "groupOrderId" TEXT,
ADD COLUMN     "hospitalName" TEXT,
ADD COLUMN     "orderNo" TEXT NOT NULL,
ADD COLUMN     "orderNote" TEXT,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "paymentMode" "OrderPaymentMode",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "specialNotes" TEXT,
ADD COLUMN     "totalQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "town" TEXT,
ALTER COLUMN "orderDate" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "totalAmount" SET NOT NULL,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "advanceAmount" SET NOT NULL,
ALTER COLUMN "advanceAmount" SET DEFAULT 0,
ALTER COLUMN "balanceAmount" SET NOT NULL,
ALTER COLUMN "balanceAmount" SET DEFAULT 0,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "categoryId",
DROP COLUMN "itemDescription",
DROP COLUMN "lineTotal",
DROP COLUMN "notes",
DROP COLUMN "quantity",
ADD COLUMN     "category" "BlockCategory" NOT NULL,
ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "itemNote" TEXT,
ADD COLUMN     "measurementId" TEXT,
ADD COLUMN     "qty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tailorNote" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT,
ALTER COLUMN "unitPrice" SET NOT NULL,
ALTER COLUMN "unitPrice" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "notes",
DROP COLUMN "referenceNumber",
ADD COLUMN     "advanceAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "balanceAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "bankReference" TEXT,
ADD COLUMN     "categorySnapshot" TEXT,
ADD COLUMN     "courierCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customerAddressSnapshot" TEXT,
ADD COLUMN     "customerNameSnapshot" TEXT,
ADD COLUMN     "groupOrderId" TEXT,
ADD COLUMN     "hospitalSnapshot" TEXT,
ADD COLUMN     "onlineTransfer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderNoSnapshot" TEXT,
ADD COLUMN     "paymentNo" TEXT NOT NULL,
ADD COLUMN     "paymentTime" TEXT,
ADD COLUMN     "qtySnapshot" INTEGER,
ADD COLUMN     "specialNotes" TEXT,
ADD COLUMN     "status" "PaymentRecordStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "townSnapshot" TEXT,
ADD COLUMN     "transactionNo" TEXT,
ADD COLUMN     "unitSnapshot" TEXT,
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "paidAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "isActive",
DROP COLUMN "slug",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "passwordHash",
DROP COLUMN "status",
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WhatsappMessage" ADD COLUMN     "groupOrderId" TEXT;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CustomerBlock";

-- DropTable
DROP TABLE "Membership";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RolePermission";

-- DropTable
DROP TABLE "Session";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "OrderSource";

-- DropEnum
DROP TYPE "PermissionAction";

-- DropEnum
DROP TYPE "SessionStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "measurementNo" TEXT,
    "category" "BlockCategory" NOT NULL,
    "values" JSONB NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "groupOrderNo" TEXT NOT NULL,
    "coordinatorCustomerId" TEXT,
    "title" TEXT,
    "hospitalName" TEXT,
    "town" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "deliveryAddress" TEXT,
    "deliveryTown" TEXT,
    "status" "GroupOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalQty" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "advanceAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "courierCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expectedDeliveryDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Measurement_tenantId_idx" ON "Measurement"("tenantId");

-- CreateIndex
CREATE INDEX "Measurement_customerId_idx" ON "Measurement"("customerId");

-- CreateIndex
CREATE INDEX "Measurement_blockId_idx" ON "Measurement"("blockId");

-- CreateIndex
CREATE INDEX "Measurement_category_idx" ON "Measurement"("category");

-- CreateIndex
CREATE INDEX "Measurement_isActive_idx" ON "Measurement"("isActive");

-- CreateIndex
CREATE INDEX "GroupOrder_tenantId_idx" ON "GroupOrder"("tenantId");

-- CreateIndex
CREATE INDEX "GroupOrder_groupOrderNo_idx" ON "GroupOrder"("groupOrderNo");

-- CreateIndex
CREATE INDEX "GroupOrder_coordinatorCustomerId_idx" ON "GroupOrder"("coordinatorCustomerId");

-- CreateIndex
CREATE INDEX "GroupOrder_status_idx" ON "GroupOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GroupOrder_tenantId_groupOrderNo_key" ON "GroupOrder"("tenantId", "groupOrderNo");

-- CreateIndex
CREATE INDEX "Block_tenantId_idx" ON "Block"("tenantId");

-- CreateIndex
CREATE INDEX "Block_customerId_idx" ON "Block"("customerId");

-- CreateIndex
CREATE INDEX "Block_blockNo_idx" ON "Block"("blockNo");

-- CreateIndex
CREATE INDEX "Block_category_idx" ON "Block"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Block_tenantId_blockNo_category_key" ON "Block"("tenantId", "blockNo", "category");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE INDEX "Customer_fullName_idx" ON "Customer"("fullName");

-- CreateIndex
CREATE INDEX "Customer_phoneNumber_idx" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "Customer_town_idx" ON "Customer"("town");

-- CreateIndex
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");

-- CreateIndex
CREATE INDEX "Order_orderNo_idx" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_groupOrderId_idx" ON "Order"("groupOrderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNo_key" ON "Order"("tenantId", "orderNo");

-- CreateIndex
CREATE INDEX "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItem_measurementId_idx" ON "OrderItem"("measurementId");

-- CreateIndex
CREATE INDEX "OrderItem_category_idx" ON "OrderItem"("category");

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentNo_idx" ON "Payment"("paymentNo");

-- CreateIndex
CREATE INDEX "Payment_groupOrderId_idx" ON "Payment"("groupOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tenantId_paymentNo_key" ON "Payment"("tenantId", "paymentNo");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE INDEX "Tenant_code_idx" ON "Tenant"("code");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "WhatsappMessage_whatsappAccountId_idx" ON "WhatsappMessage"("whatsappAccountId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_groupOrderId_idx" ON "WhatsappMessage"("groupOrderId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_createdAt_idx" ON "WhatsappMessage"("createdAt");

-- CreateIndex
CREATE INDEX "WhatsappTemplate_status_idx" ON "WhatsappTemplate"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_coordinatorCustomerId_fkey" FOREIGN KEY ("coordinatorCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_groupOrderId_fkey" FOREIGN KEY ("groupOrderId") REFERENCES "GroupOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_groupOrderId_fkey" FOREIGN KEY ("groupOrderId") REFERENCES "GroupOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappAccount" ADD CONSTRAINT "WhatsappAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_groupOrderId_fkey" FOREIGN KEY ("groupOrderId") REFERENCES "GroupOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
