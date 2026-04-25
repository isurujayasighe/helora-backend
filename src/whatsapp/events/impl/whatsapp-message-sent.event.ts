export class WhatsappMessageSentEvent {
  constructor(
    public readonly payload: {
      tenantId: string;
      messageId: string;
      whatsappMessageId?: string;
      customerId?: string | null;
      orderId?: string | null;
      paymentId?: string | null;
    }
  ) {}
}