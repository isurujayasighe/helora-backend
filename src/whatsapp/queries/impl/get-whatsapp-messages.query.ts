import { WhatsappMessageFilterDto } from "src/whatsapp/dto/whatsapp-message-filter.dto";


export class GetWhatsappMessagesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: WhatsappMessageFilterDto
  ) {}
}