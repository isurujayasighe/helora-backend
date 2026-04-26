// Add these fields to your existing ListOrdersDto class.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ListOrdersDtoGroupOrderAdditions {
  @ApiPropertyOptional({ example: 'group_order_cuid' })
  @IsOptional()
  @IsString()
  groupOrderId?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  groupOrdersOnly?: boolean;
}
