-- CreateEnum
CREATE TYPE "WhatsappTemplateCategory" AS ENUM ('UTILITY', 'MARKETING', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "WhatsappTemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISABLED');

-- CreateEnum
CREATE TYPE "WhatsappMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "WhatsappMessageType" AS ENUM ('TEXT', 'TEMPLATE', 'IMAGE', 'DOCUMENT', 'BUTTON', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "WhatsappMessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateTable
CREATE TABLE "WhatsappAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessName" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "businessAccountId" TEXT,
    "accessToken" TEXT NOT NULL,
    "webhookVerifyToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "whatsappAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WhatsappTemplateCategory" NOT NULL,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "status" "WhatsappTemplateStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "bodyPreview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "whatsappAccountId" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "direction" "WhatsappMessageDirection" NOT NULL,
    "messageType" "WhatsappMessageType" NOT NULL,
    "status" "WhatsappMessageStatus" NOT NULL DEFAULT 'PENDING',
    "whatsappMessageId" TEXT,
    "fromPhone" TEXT,
    "toPhone" TEXT NOT NULL,
    "templateName" TEXT,
    "languageCode" TEXT,
    "body" TEXT,
    "payload" JSONB,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsappAccount_tenantId_idx" ON "WhatsappAccount"("tenantId");

-- CreateIndex
CREATE INDEX "WhatsappAccount_phoneNumberId_idx" ON "WhatsappAccount"("phoneNumberId");

-- CreateIndex
CREATE INDEX "WhatsappTemplate_tenantId_idx" ON "WhatsappTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "WhatsappTemplate_whatsappAccountId_idx" ON "WhatsappTemplate"("whatsappAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappTemplate_tenantId_name_languageCode_key" ON "WhatsappTemplate"("tenantId", "name", "languageCode");

-- CreateIndex
CREATE INDEX "WhatsappMessage_tenantId_idx" ON "WhatsappMessage"("tenantId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_customerId_idx" ON "WhatsappMessage"("customerId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_orderId_idx" ON "WhatsappMessage"("orderId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_paymentId_idx" ON "WhatsappMessage"("paymentId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_whatsappMessageId_idx" ON "WhatsappMessage"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_status_idx" ON "WhatsappMessage"("status");

-- AddForeignKey
ALTER TABLE "WhatsappTemplate" ADD CONSTRAINT "WhatsappTemplate_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMessage" ADD CONSTRAINT "WhatsappMessage_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
