import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma/prisma.service";
import { ProcessWhatsappWebhookCommand } from "../impl/process-whatsapp-webhook.command";
import { WhatsappMessageStatusUpdatedEvent } from "src/whatsapp/events/impl/whatsapp-message-status-updated.event";
import { WhatsappMessageReceivedEvent } from "src/whatsapp/events/impl/whatsapp-message-received.event";

@CommandHandler(ProcessWhatsappWebhookCommand)
export class ProcessWhatsappWebhookHandler
  implements ICommandHandler<ProcessWhatsappWebhookCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ProcessWhatsappWebhookCommand) {
    const entries = command.body?.entry ?? [];

    for (const entry of entries) {
      const changes = entry?.changes ?? [];

      for (const change of changes) {
        const value = change?.value;

        await this.processStatuses(value?.statuses ?? []);
        await this.processIncomingMessages(value?.messages ?? [], value?.metadata);
      }
    }

    return {
      received: true,
    };
  }

  private async processStatuses(statuses: any[]) {
    for (const statusItem of statuses) {
      const whatsappMessageId = statusItem.id;
      const mappedStatus = this.mapWhatsappStatus(statusItem.status);

      const existing = await this.prisma.whatsappMessage.findFirst({
        where: {
          whatsappMessageId,
        },
      });

      if (!existing) {
        continue;
      }

      const updated = await this.prisma.whatsappMessage.update({
        where: {
          id: existing.id,
        },
        data: {
          status: mappedStatus,
          deliveredAt:
            mappedStatus === "DELIVERED" ? new Date() : existing.deliveredAt,
          readAt: mappedStatus === "READ" ? new Date() : existing.readAt,
          failedAt: mappedStatus === "FAILED" ? new Date() : existing.failedAt,
          failureReason: statusItem.errors?.[0]?.title,
          payload: statusItem,
        },
      });

      this.eventBus.publish(
        new WhatsappMessageStatusUpdatedEvent({
          tenantId: updated.tenantId,
          messageId: updated.id,
          whatsappMessageId,
          status: mappedStatus,
        })
      );
    }
  }

  private async processIncomingMessages(messages: any[], metadata: any) {
    const phoneNumberId = metadata?.phone_number_id;

    const account = await this.prisma.whatsappAccount.findFirst({
      where: {
        phoneNumberId,
        isActive: true,
      },
    });

    if (!account) {
      return;
    }

    for (const incoming of messages) {
      const fromPhone = incoming.from;
      const textBody = incoming.text?.body ?? "";

      const customer = await this.prisma.customer.findFirst({
        where: {
          tenantId: account.tenantId,
          OR: [
            {
              phoneNumber: {
                contains: fromPhone.slice(-9),
              },
            },
            {
              alternatePhone: {
                contains: fromPhone.slice(-9),
              },
            },
          ],
        },
      });

      const message = await this.prisma.whatsappMessage.create({
        data: {
          tenantId: account.tenantId,
          whatsappAccountId: account.id,
          customerId: customer?.id,
          direction: "INBOUND",
          messageType: "TEXT",
          status: "RECEIVED",
          whatsappMessageId: incoming.id,
          fromPhone,
          toPhone: metadata?.display_phone_number ?? "",
          body: textBody,
          payload: incoming,
        },
      });

      this.eventBus.publish(
        new WhatsappMessageReceivedEvent({
          tenantId: account.tenantId,
          messageId: message.id,
          whatsappMessageId: incoming.id,
          customerId: customer?.id,
          fromPhone,
          body: textBody,
        })
      );
    }
  }

  private mapWhatsappStatus(status: string) {
    switch (status) {
      case "sent":
        return "SENT";
      case "delivered":
        return "DELIVERED";
      case "read":
        return "READ";
      case "failed":
        return "FAILED";
      default:
        return "PENDING";
    }
  }
}