-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('DREZAURA', 'PHYSICAL_SHOP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderSource" "OrderSource" NOT NULL DEFAULT 'PHYSICAL_SHOP';

-- CreateIndex
CREATE INDEX "Order_tenantId_orderSource_idx" ON "Order"("tenantId", "orderSource");
