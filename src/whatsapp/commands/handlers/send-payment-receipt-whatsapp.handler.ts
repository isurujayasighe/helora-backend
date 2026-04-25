import { BadRequestException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma/prisma.service";
import { WhatsappCloudApiService } from "src/whatsapp/services/whatsapp-cloud-api.service";
import { WhatsappPhoneService } from "src/whatsapp/services/whatsapp-phone.service";
import { WhatsappTemplateBuilderService } from "src/whatsapp/services/whatsapp-template-builder.service";
import { SendPaymentReceiptWhatsappCommand } from "../impl/send-payment-receipt-whatsapp.command";
import { WhatsappMessageSentEvent } from "src/whatsapp/events/impl/whatsapp-message-sent.event";

@CommandHandler(SendPaymentReceiptWhatsappCommand)
export class SendPaymentReceiptWhatsappHandler
  implements ICommandHandler<SendPaymentReceiptWhatsappCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudApi: WhatsappCloudApiService,
    private readonly phoneService: WhatsappPhoneService,
    private readonly templateBuilder: WhatsappTemplateBuilderService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SendPaymentReceiptWhatsappCommand) {
    const { tenantId, paymentId } = command;

    const account = await this.prisma.whatsappAccount.findFirst({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (!account) {
      throw new BadRequestException("Active WhatsApp account is not configured");
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
      include: {
        customer: true,
        order: true,
      },
    });

    if (!payment) {
      throw new BadRequestException("Payment not found");
    }

    if (!payment.customer?.phoneNumber) {
      throw new BadRequestException("Customer phone number not found");
    }

    const toPhone = this.phoneService.normalizeSriLankanPhone(
      payment.customer.phoneNumber
    );

    const templateName = "payment_received";
    const languageCode = "en";

    const bodyParameters =
      this.templateBuilder.buildPaymentReceivedTemplateParams(payment);

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
        customerId: payment.customerId,
        orderId: payment.orderId,
        paymentId: payment.id,
        direction: "OUTBOUND",
        messageType: "TEMPLATE",
        status: "SENT",
        whatsappMessageId: apiResult.whatsappMessageId,
        toPhone,
        templateName,
        languageCode,
        payload: apiResult.payload,
        sentAt: new Date(),
      },
    });

    this.eventBus.publish(
      new WhatsappMessageSentEvent({
        tenantId,
        messageId: message.id,
        whatsappMessageId: apiResult.whatsappMessageId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        paymentId: payment.id,
      })
    );

    return {
      success: true,
      message,
    };
  }
}