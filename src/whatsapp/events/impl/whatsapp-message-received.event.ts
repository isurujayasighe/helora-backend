export class WhatsappMessageReceivedEvent {
  constructor(
    public readonly payload: {
      tenantId: string;
      messageId: string;
      whatsappMessageId?: string;
      customerId?: string | null;
      fromPhone: string;
      body: string;
    }
  ) {}
}