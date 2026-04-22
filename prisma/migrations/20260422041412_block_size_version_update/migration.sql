-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "fitNotes" TEXT,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "previousBlockId" TEXT,
ADD COLUMN     "readyMadeSize" TEXT,
ADD COLUMN     "sizeLabel" TEXT,
ADD COLUMN     "versionNo" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Block_tenantId_readyMadeSize_idx" ON "Block"("tenantId", "readyMadeSize");

-- CreateIndex
CREATE INDEX "Block_tenantId_customerId_categoryId_idx" ON "Block"("tenantId", "customerId", "categoryId");

-- CreateIndex
CREATE INDEX "Block_tenantId_customerId_categoryId_readyMadeSize_idx" ON "Block"("tenantId", "customerId", "categoryId", "readyMadeSize");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_previousBlockId_fkey" FOREIGN KEY ("previousBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
