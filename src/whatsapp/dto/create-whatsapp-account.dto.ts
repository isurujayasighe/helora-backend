import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWhatsappAccountDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumberId!: string;

  @IsOptional()
  @IsString()
  businessAccountId?: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsOptional()
  @IsString()
  webhookVerifyToken?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}