import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export enum OrderSource {
  DREZAURA = 'DREZAURA',
  PHYSICAL_SHOP = 'PHYSICAL_SHOP',
}

export class CreateOrderDto {
  @ApiProperty({ example: 'customer_cuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'ORD-1001' })
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @ApiPropertyOptional({ example: '2026-04-21T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ example: '2026-04-28T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    enum: OrderSource,
    example: OrderSource.PHYSICAL_SHOP,
    default: OrderSource.PHYSICAL_SHOP,
  })
  @IsOptional()
  @IsEnum(OrderSource)
  orderSource?: OrderSource;

  @ApiPropertyOptional({ example: 'Order for 2 uniforms' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  totalAmount?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @Type(() => Number)
  advanceAmount?: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  balanceAmount?: number;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}