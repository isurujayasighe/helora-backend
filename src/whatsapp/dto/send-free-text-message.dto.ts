import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendFreeTextMessageDto {
  @IsString()
  @IsNotEmpty()
  toPhone: string | undefined;

  @IsString()
  @IsNotEmpty()
  message: string | undefined;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}