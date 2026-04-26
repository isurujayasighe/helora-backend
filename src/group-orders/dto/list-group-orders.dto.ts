import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GROUP_ORDER_STATUSES,
  GroupOrderStatusValue,
} from './create-group-order.dto';

export class ListGroupOrdersDto {
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

  @ApiPropertyOptional({ example: 'Horana' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ example: 'DRAFT', enum: GROUP_ORDER_STATUSES })
  @IsOptional()
  @IsIn(GROUP_ORDER_STATUSES)
  status?: GroupOrderStatusValue;

  @ApiPropertyOptional({ example: 'customer_cuid' })
  @IsOptional()
  @IsString()
  coordinatorCustomerId?: string;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-04-30T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
