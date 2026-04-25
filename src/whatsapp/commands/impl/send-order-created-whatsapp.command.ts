export class SendOrderCreatedWhatsappCommand {
  constructor(
    public readonly tenantId: string,
    public readonly orderId: string,
    public readonly userId?: string | null
  ) {}
}