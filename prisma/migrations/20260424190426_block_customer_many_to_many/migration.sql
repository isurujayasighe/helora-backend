/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Block` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Customer_tenantId_fullName_idx";

-- DropIndex
DROP INDEX "Customer_tenantId_phoneNumber_idx";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "isDefault";
