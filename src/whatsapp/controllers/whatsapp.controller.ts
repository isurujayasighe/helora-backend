import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { CreateWhatsappAccountDto } from "../dto/create-whatsapp-account.dto";
import { WhatsappMessageFilterDto } from "../dto/whatsapp-message-filter.dto";

import { CreateWhatsappAccountCommand } from "../commands/impl/create-whatsapp-account.command";
import { GetWhatsappAccountQuery } from "../queries/impl/get-whatsapp-account.query";
import { SendOrderCreatedWhatsappCommand } from "../commands/impl/send-order-created-whatsapp.command";
import { SendPaymentReceiptWhatsappCommand } from "../commands/impl/send-payment-receipt-whatsapp.command";
import { GetWhatsappMessagesQuery } from "../queries/impl/get-whatsapp-messages.query";

@Controller("whatsapp")
export class WhatsappController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  private getTenantId(req: any, fallbackTenantId?: string) {
    const tenantId = req.user?.tenantId ?? fallbackTenantId;

    if (!tenantId) {
      throw new BadRequestException(
        "Tenant ID is required. Login user tenantId was not found, and tenantId was not provided."
      );
    }

    return tenantId;
  }

  @Post("account")
  async createAccount(@Req() req: any, @Body() dto: CreateWhatsappAccountDto) {
    const tenantId = this.getTenantId(req, dto.tenantId);

    return this.commandBus.execute(
      new CreateWhatsappAccountCommand(tenantId, dto)
    );
  }

  @Get("account")
  async getAccount(@Req() req: any, @Query("tenantId") tenantIdFromQuery?: string) {
    const tenantId = this.getTenantId(req, tenantIdFromQuery);

    return this.queryBus.execute(new GetWhatsappAccountQuery(tenantId));
  }

  @Post("orders/:orderId/send-confirmation")
  async sendOrderConfirmation(
    @Req() req: any,
    @Param("orderId") orderId: string,
    @Body("tenantId") tenantIdFromBody?: string
  ) {
    const tenantId = this.getTenantId(req, tenantIdFromBody);
    const userId = req.user?.id ?? null;

    return this.commandBus.execute(
      new SendOrderCreatedWhatsappCommand(tenantId, orderId, userId)
    );
  }

  @Post("payments/:paymentId/send-receipt")
  async sendPaymentReceipt(
    @Req() req: any,
    @Param("paymentId") paymentId: string,
    @Body("tenantId") tenantIdFromBody?: string
  ) {
    const tenantId = this.getTenantId(req, tenantIdFromBody);
    const userId = req.user?.id ?? null;

    return this.commandBus.execute(
      new SendPaymentReceiptWhatsappCommand(tenantId, paymentId, userId)
    );
  }

  @Get("messages")
  async getMessages(
    @Req() req: any,
    @Query() filters: WhatsappMessageFilterDto
  ) {
    const tenantId = this.getTenantId(req, filters.customerId);

    return this.queryBus.execute(
      new GetWhatsappMessagesQuery(tenantId, filters)
    );
  }
}