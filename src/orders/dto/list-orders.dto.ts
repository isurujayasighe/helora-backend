import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CUTTING',
  'SEWING',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const ORDER_SOURCES = [
  'DREZAURA',
  'PHYSICAL_SHOP',
  'PHONE_CALL',
  'WHATSAPP',
  'ONLINE',
] as const;

export const PAYMENT_STATUSES = [
  'UNPAID',
  'ADVANCE_PAID',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type OrderSourceValue = (typeof ORDER_SOURCES)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export class ListOrdersDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'ORD-1001' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ORDER_STATUSES,
  })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatusValue;

  @ApiPropertyOptional({
    example: 'PHYSICAL_SHOP',
    enum: ORDER_SOURCES,
  })
  @IsOptional()
  @IsIn(ORDER_SOURCES)
  orderSource?: OrderSourceValue;

  @ApiPropertyOptional({
    example: 'UNPAID',
    enum: PAYMENT_STATUSES,
  })
  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: PaymentStatusValue;

  @ApiPropertyOptional({ example: '2026-04-25' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-05-02' })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiPropertyOptional({ example: 'customer_cuid' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'group_order_cuid' })
  @IsOptional()
  @IsString()
  groupOrderId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  groupOrdersOnly?: boolean;
}