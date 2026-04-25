import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WhatsappMessageStatusUpdatedEvent } from "../impl/whatsapp-message-status-updated.event";

@EventsHandler(WhatsappMessageStatusUpdatedEvent)
export class WhatsappMessageStatusUpdatedHandler
  implements IEventHandler<WhatsappMessageStatusUpdatedEvent>
{
  async handle(event: WhatsappMessageStatusUpdatedEvent) {
    console.log("WhatsApp message status updated", event.payload);
  }
}