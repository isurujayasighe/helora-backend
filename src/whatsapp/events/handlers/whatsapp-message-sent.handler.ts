import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WhatsappMessageSentEvent } from "../impl/whatsapp-message-sent.event";


@EventsHandler(WhatsappMessageSentEvent)
export class WhatsappMessageSentHandler
  implements IEventHandler<WhatsappMessageSentEvent>
{
  async handle(event: WhatsappMessageSentEvent) {
    console.log("WhatsApp message sent", event.payload);
  }
}