export class SendPaymentReceiptWhatsappCommand {
  constructor(
    public readonly tenantId: string,
    public readonly paymentId: string,
    public readonly requestedById?: string
  ) {}
}