import { CreateWhatsappAccountDto } from "../../dto/create-whatsapp-account.dto";

export class CreateWhatsappAccountCommand {
  constructor(
    public readonly tenantId: string,
    public readonly dto: CreateWhatsappAccountDto
  ) {}
}