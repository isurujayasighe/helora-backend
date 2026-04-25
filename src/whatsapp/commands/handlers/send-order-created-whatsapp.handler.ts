import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Prisma } from "@prisma/client";

import { SendOrderCreatedWhatsappCommand } from "../impl/send-order-created-whatsapp.command";
import { PrismaService } from "src/prisma/prisma.service";
import { WhatsappCloudApiService } from "src/whatsapp/services/whatsapp-cloud-api.service";
import { WhatsappPhoneService } from "src/whatsapp/services/whatsapp-phone.service";
import { WhatsappTemplateBuilderService } from "src/whatsapp/services/whatsapp-template-builder.service";

@CommandHandler(SendOrderCreatedWhatsappCommand)
export class SendOrderCreatedWhatsappHandler
  implements ICommandHandler<SendOrderCreatedWhatsappCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudApi: WhatsappCloudApiService,
    private readonly phoneService: WhatsappPhoneService,
    private readonly templateBuilder: WhatsappTemplateBuilderService
  ) {}

  async execute(command: SendOrderCreatedWhatsappCommand) {
    const { tenantId, orderId } = command;

    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }

    if (!orderId) {
      throw new BadRequestException("Order ID is required");
    }

    const account = await this.prisma.whatsappAccount.findFirst({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException("Active WhatsApp account is not configured");
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
      include: {
        customer: true,
        items: {
          include: {
            category: true,
            block: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (!order.customer?.phoneNumber) {
      throw new BadRequestException("Customer phone number not found");
    }

    const toPhone = this.phoneService.normalizeSriLankanPhone(
      order.customer.phoneNumber
    );

    if (!toPhone) {
      throw new BadRequestException("Invalid customer phone number");
    }

    const templateName = "order_confirmation"; // TODO: Use actual template name
    const languageCode = "en_US";

    const bodyParameters =
      this.templateBuilder.buildOrderCreatedTemplateParams(order);

    try {
      const apiResult = await this.cloudApi.sendTemplateMessage({
        accessToken: account.accessToken,
        phoneNumberId: account.phoneNumberId,
        toPhone,
        templateName,
        languageCode,
        bodyParameters,
      });

      const message = await this.prisma.whatsappMessage.create({
        data: {
          tenantId,
          whatsappAccountId: account.id,
          customerId: order.customerId,
          orderId: order.id,

          direction: "OUTBOUND",
          messageType: "TEMPLATE",
          status: "SENT",

          whatsappMessageId: apiResult.whatsappMessageId,
          fromPhone: account.phoneNumber,
          toPhone,

          templateName,
          languageCode,
          body: null,
          payload: apiResult.payload as Prisma.InputJsonValue,

          sentAt: new Date(),
        },
      });

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error("SendOrderCreatedWhatsappHandler error:", error);

      const failureReason =
        error instanceof Error
          ? error.message
          : "Failed to send WhatsApp order confirmation";

      const failedMessage = await this.prisma.whatsappMessage.create({
        data: {
          tenantId,
          whatsappAccountId: account.id,
          customerId: order.customerId,
          orderId: order.id,

          direction: "OUTBOUND",
          messageType: "TEMPLATE",
          status: "FAILED",

          fromPhone: account.phoneNumber,
          toPhone,

          templateName,
          languageCode,
          body: null,
          payload: {
            templateName,
            languageCode,
            bodyParameters,
            error: failureReason,
          },

          failedAt: new Date(),
          failureReason,
        },
      });

      return {
        success: false,
        message: failedMessage,
        error: failureReason,
      };
    }
  }
}