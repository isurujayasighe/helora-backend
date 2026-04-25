export class WhatsappMessageStatusUpdatedEvent {
  constructor(
    public readonly payload: {
      tenantId: string;
      messageId: string;
      whatsappMessageId?: string;
      status: string;
    }
  ) {}
}