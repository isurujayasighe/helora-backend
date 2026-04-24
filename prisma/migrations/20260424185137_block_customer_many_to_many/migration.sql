/*
  Warnings:

  - You are about to drop the column `customerId` on the `Block` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_customerId_fkey";

-- DropIndex
DROP INDEX "Block_tenantId_customerId_categoryId_idx";

-- DropIndex
DROP INDEX "Block_tenantId_customerId_categoryId_readyMadeSize_idx";

-- DropIndex
DROP INDEX "Block_tenantId_customerId_idx";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "customerId";

-- CreateTable
CREATE TABLE "CustomerBlock" (
    "customerId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "CustomerBlock_pkey" PRIMARY KEY ("customerId","blockId")
);

-- CreateIndex
CREATE INDEX "CustomerBlock_blockId_idx" ON "CustomerBlock"("blockId");

-- CreateIndex
CREATE INDEX "CustomerBlock_customerId_idx" ON "CustomerBlock"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerBlock" ADD CONSTRAINT "CustomerBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
