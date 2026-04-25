import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma/prisma.service";
import { GetWhatsappAccountQuery } from "../impl/get-whatsapp-account.query";

@QueryHandler(GetWhatsappAccountQuery)
export class GetWhatsappAccountHandler
  implements IQueryHandler<GetWhatsappAccountQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWhatsappAccountQuery) {
    const account = await this.prisma.whatsappAccount.findFirst({
      where: {
        tenantId: query.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        tenantId: true,
        businessName: true,
        phoneNumber: true,
        phoneNumberId: true,
        businessAccountId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return account;
  }
}