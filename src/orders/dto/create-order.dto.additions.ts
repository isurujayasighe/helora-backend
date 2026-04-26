// Add this field to your existing CreateOrderDto class.

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDtoGroupOrderAdditions {
  @ApiPropertyOptional({ example: 'group_order_cuid' })
  @IsOptional()
  @IsString()
  groupOrderId?: string;
}
