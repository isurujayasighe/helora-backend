import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma/prisma.service";
import { GetWhatsappMessagesQuery } from "../impl/get-whatsapp-messages.query";

@QueryHandler(GetWhatsappMessagesQuery)
export class GetWhatsappMessagesHandler
  implements IQueryHandler<GetWhatsappMessagesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWhatsappMessagesQuery) {
    const { tenantId, filters } = query;

    return this.prisma.whatsappMessage.findMany({
      where: {
        tenantId,
        customerId: filters.customerId,
        orderId: filters.orderId,
        paymentId: filters.paymentId,
        status: filters.status as any,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }
}