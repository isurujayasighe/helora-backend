import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const GROUP_ORDER_STATUSES = [
  'DRAFT',
  'CONFIRMED',
  'IN_PROGRESS',
  'READY',
  'PARTIALLY_DELIVERED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type GroupOrderStatusValue = (typeof GROUP_ORDER_STATUSES)[number];

export class CreateGroupOrderDto {
  @ApiPropertyOptional({ example: 'GRP-00001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  groupOrderNumber?: string;

  @ApiPropertyOptional({ example: 'Horana Hospital Nurses - April Batch' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'customer_cuid' })
  @IsOptional()
  @IsString()
  coordinatorCustomerId?: string;

  @ApiPropertyOptional({ example: 'Horana Hospital' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  hospitalName?: string;

  @ApiPropertyOptional({ example: 'Horana' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  town?: string;

  @ApiPropertyOptional({ example: 'Dinesha Shamali' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @ApiPropertyOptional({ example: '0718370292' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'No 12, Main Street, Horana' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: 'Horana' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deliveryTown?: string;

  @ApiPropertyOptional({
    example: 'DRAFT',
    enum: GROUP_ORDER_STATUSES,
  })
  @IsOptional()
  @IsIn(GROUP_ORDER_STATUSES)
  status?: GroupOrderStatusValue;

  @ApiPropertyOptional({ example: '2026-05-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Deliver all uniforms together.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
