import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";


import { WhatsappController } from "./controllers/whatsapp.controller";
import { WhatsappWebhookController } from "./controllers/whatsapp-webhook.controller";

import { WhatsappCloudApiService } from "./services/whatsapp-cloud-api.service";
import { WhatsappPhoneService } from "./services/whatsapp-phone.service";
import { WhatsappTemplateBuilderService } from "./services/whatsapp-template-builder.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWhatsappAccountHandler } from "./commands/handlers/create-whatsapp-account.handler";
import { ProcessWhatsappWebhookHandler } from "./commands/handlers/process-whatsapp-webhook.handler";
import { SendOrderCreatedWhatsappHandler } from "./commands/handlers/send-order-created-whatsapp.handler";
import { SendPaymentReceiptWhatsappHandler } from "./commands/handlers/send-payment-receipt-whatsapp.handler";
import { WhatsappMessageReceivedHandler } from "./events/handlers/whatsapp-message-received.handler";
import { WhatsappMessageSentHandler } from "./events/handlers/whatsapp-message-sent.handler";
import { WhatsappMessageStatusUpdatedHandler } from "./events/handlers/whatsapp-message-status-updated.handler";
import { GetWhatsappAccountHandler } from "./queries/handlers/get-whatsapp-account.handler";
import { GetWhatsappMessagesHandler } from "./queries/handlers/get-whatsapp-messages.handler";



const CommandHandlers = [
  CreateWhatsappAccountHandler,
  SendOrderCreatedWhatsappHandler,
  SendPaymentReceiptWhatsappHandler,
  ProcessWhatsappWebhookHandler,
];

const QueryHandlers = [
  GetWhatsappAccountHandler,
  GetWhatsappMessagesHandler,
];

const EventHandlers = [
  WhatsappMessageSentHandler,
  WhatsappMessageReceivedHandler,
  WhatsappMessageStatusUpdatedHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [WhatsappController, WhatsappWebhookController],
  providers: [
    PrismaService,

    WhatsappCloudApiService,
    WhatsappPhoneService,
    WhatsappTemplateBuilderService,

    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [
    WhatsappCloudApiService,
    WhatsappPhoneService,
  ],
})
export class WhatsappModule {}