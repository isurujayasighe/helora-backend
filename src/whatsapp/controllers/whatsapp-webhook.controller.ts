import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { ProcessWhatsappWebhookCommand } from "../commands/impl/process-whatsapp-webhook.command";

@Controller("whatsapp/webhook")
export class WhatsappWebhookController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") verifyToken: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && verifyToken === expectedToken) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  @Post()
  async receiveWebhook(@Body() body: any) {
    return this.commandBus.execute(new ProcessWhatsappWebhookCommand(body));
  }
}