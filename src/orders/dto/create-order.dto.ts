import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CreateOrderStatusDto {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CUTTING = 'CUTTING',
  SEWING = 'SEWING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum CreateOrderSourceDto {
  DREZAURA = 'DREZAURA',
  PHYSICAL_SHOP = 'PHYSICAL_SHOP',
  PHONE_CALL = 'PHONE_CALL',
  WHATSAPP = 'WHATSAPP',
  ONLINE = 'ONLINE',
}

export enum CreatePaymentStatusDto {
  UNPAID = 'UNPAID',
  ADVANCE_PAID = 'ADVANCE_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum CreateOrderPaymentModeDto {
  CASH = 'CASH',
  ONLINE_TRANSFER = 'ONLINE_TRANSFER',
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  CARD = 'CARD',
  MIXED = 'MIXED',
}

export enum CreateOrderItemStatusDto {
  PENDING = 'PENDING',
  CUTTING = 'CUTTING',
  SEWING = 'SEWING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'category_cuid',
  })
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({
    example: 'block_cuid',
  })
  @IsOptional()
  @IsString()
  blockId?: string;

  @ApiPropertyOptional({
    example: 'measurement_cuid',
    description:
      'Existing measurement id. If not provided, backend can create a new measurement using measurements object.',
  })
  @IsOptional()
  @IsString()
  measurementId?: string;

  @ApiProperty({
    example: 'Nurse uniform',
  })
  @IsString()
  itemDescription!: string;

  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 2500,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({
    example: 2500,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lineTotal!: number;

  @ApiPropertyOptional({
    example: 'Customer requested loose fit',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Use previous cutting style',
  })
  @IsOptional()
  @IsString()
  tailorNote?: string;

  @ApiPropertyOptional({
    enum: CreateOrderItemStatusDto,
    example: CreateOrderItemStatusDto.PENDING,
  })
  @IsOptional()
  @IsEnum(CreateOrderItemStatusDto)
  status?: CreateOrderItemStatusDto;

  @ApiPropertyOptional({
    example: {
      shoulder: '14.5',
      chest: '34',
      waist: '39',
      hip: '36',
    },
    description:
      'Measurement values by measurement field code. Used only when measurementId is not provided.',
  })
  @IsOptional()
  @IsObject()
  measurements?: Record<string, string | number | null>;

  @ApiPropertyOptional({
    example: 'Measurements taken while placing order.',
  })
  @IsOptional()
  @IsString()
  measurementNote?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'customer_cuid',
  })
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({
    example: 'group_order_cuid',
  })
  @IsOptional()
  @IsString()
  groupOrderId?: string;

  @ApiPropertyOptional({
    example: 'ORD-1001',
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiPropertyOptional({
    example: '2026-04-25T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-02T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-02T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({
    example: '2026-05-02T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiPropertyOptional({
    enum: CreateOrderStatusDto,
    example: CreateOrderStatusDto.PENDING,
  })
  @IsOptional()
  @IsEnum(CreateOrderStatusDto)
  status?: CreateOrderStatusDto;

  @ApiPropertyOptional({
    enum: CreateOrderSourceDto,
    example: CreateOrderSourceDto.PHYSICAL_SHOP,
  })
  @IsOptional()
  @IsEnum(CreateOrderSourceDto)
  orderSource?: CreateOrderSourceDto;

  @ApiPropertyOptional({
    enum: CreatePaymentStatusDto,
    example: CreatePaymentStatusDto.UNPAID,
  })
  @IsOptional()
  @IsEnum(CreatePaymentStatusDto)
  paymentStatus?: CreatePaymentStatusDto;

  @ApiPropertyOptional({
    enum: CreateOrderPaymentModeDto,
    example: CreateOrderPaymentModeDto.CASH,
  })
  @IsOptional()
  @IsEnum(CreateOrderPaymentModeDto)
  paymentMode?: CreateOrderPaymentModeDto;

  @ApiPropertyOptional({
    example: 'Horana Hospital',
  })
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional({
    example: 'Horana',
  })
  @IsOptional()
  @IsString()
  town?: string;

  @ApiPropertyOptional({
    example: 'No 12, Main Street',
  })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalQty?: number;

  @ApiPropertyOptional({
    example: 2500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advanceAmount?: number;

  @ApiPropertyOptional({
    example: 1500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balanceAmount?: number;

  @ApiPropertyOptional({
    example: 350,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  courierCharges?: number;

  @ApiPropertyOptional({
    example: 'Order note',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'Special delivery note',
  })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}