import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ORDER_ITEM_STATUSES,
  ORDER_PAYMENT_MODES,
  ORDER_SOURCES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  OrderItemStatusValue,
  OrderPaymentModeValue,
  OrderSourceValue,
  OrderStatusValue,
  PaymentStatusValue,
} from './order-options.dto';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'block_cuid' })
  @IsOptional()
  @IsString()
  blockId?: string | null;

  @ApiPropertyOptional({ example: 'measurement_cuid' })
  @IsOptional()
  @IsString()
  measurementId?: string | null;

  @ApiPropertyOptional({ example: 'Nurse uniform' })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lineTotal?: number;

  @ApiPropertyOptional({ example: 'Customer requested loose fit' })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ example: 'Use previous cutting style' })
  @IsOptional()
  @IsString()
  tailorNote?: string | null;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ORDER_ITEM_STATUSES,
  })
  @IsOptional()
  @IsIn(ORDER_ITEM_STATUSES)
  status?: OrderItemStatusValue;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'customer_cuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: 'group_order_cuid' })
  @IsOptional()
  @IsString()
  groupOrderId?: string | null;

  @ApiProperty({ example: 'ORD-1001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  orderNumber!: string;

  @ApiPropertyOptional({ example: '2026-04-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-05-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  promisedDate?: string | null;

  @ApiPropertyOptional({ example: '2026-05-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string | null;

  @ApiPropertyOptional({ example: '2026-05-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string | null;

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

  @ApiPropertyOptional({
    example: 'CASH',
    enum: ORDER_PAYMENT_MODES,
  })
  @IsOptional()
  @IsIn(ORDER_PAYMENT_MODES)
  paymentMode?: OrderPaymentModeValue | null;

  @ApiPropertyOptional({ example: 'Horana Hospital' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  hospitalName?: string | null;

  @ApiPropertyOptional({ example: 'Horana' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string | null;

  @ApiPropertyOptional({ example: 'No 12, Main Street' })
  @IsOptional()
  @IsString()
  customerAddress?: string | null;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalQty?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advanceAmount?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balanceAmount?: number;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  courierCharges?: number;

  @ApiPropertyOptional({ example: 'Order note' })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({ example: 'Special delivery note' })
  @IsOptional()
  @IsString()
  specialNotes?: string | null;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}