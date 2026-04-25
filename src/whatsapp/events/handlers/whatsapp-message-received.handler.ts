import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WhatsappMessageReceivedEvent } from "../impl/whatsapp-message-received.event";

@EventsHandler(WhatsappMessageReceivedEvent)
export class WhatsappMessageReceivedHandler
  implements IEventHandler<WhatsappMessageReceivedEvent>
{
  async handle(event: WhatsappMessageReceivedEvent) {
    console.log("WhatsApp message received", event.payload);
  }
}