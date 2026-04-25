import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Prisma } from "@prisma/client";

import { CreateWhatsappAccountCommand } from "../impl/create-whatsapp-account.command";
import { PrismaService } from "src/prisma/prisma.service";

@CommandHandler(CreateWhatsappAccountCommand)
export class CreateWhatsappAccountHandler
  implements ICommandHandler<CreateWhatsappAccountCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateWhatsappAccountCommand) {
    const { tenantId, dto } = command;

    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }

    if (!dto.phoneNumber) {
      throw new BadRequestException("WhatsApp phone number is required");
    }

    if (!dto.phoneNumberId) {
      throw new BadRequestException("WhatsApp phone number ID is required");
    }

    if (!dto.accessToken) {
      throw new BadRequestException("WhatsApp access token is required");
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.isActive !== false) {
          await tx.whatsappAccount.updateMany({
            where: {
              tenantId,
              isActive: true,
            },
            data: {
              isActive: false,
            },
          });
        }

        return tx.whatsappAccount.create({
          data: {
            tenantId,
            businessName: dto.businessName ?? null,
            phoneNumber: dto.phoneNumber,
            phoneNumberId: dto.phoneNumberId,
            businessAccountId: dto.businessAccountId ?? null,
            accessToken: dto.accessToken,
            webhookVerifyToken: dto.webhookVerifyToken ?? null,
            isActive: dto.isActive ?? true,
          },
        });
      });
    } catch (error) {
      console.error("CreateWhatsappAccountHandler error:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException({
          message: "Failed to create WhatsApp account",
          prismaCode: error.code,
          meta: error.meta,
        });
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException({
          message: "Invalid WhatsApp account data",
          detail: error.message,
        });
      }

      throw new InternalServerErrorException(
        "Failed to create WhatsApp account"
      );
    }
  }
}