import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderDto } from './create-order.dto';
import { UpdateOrderItemDto } from './update-order-item.dto';

class UpdateOrderBaseDto extends PartialType(
  OmitType(CreateOrderDto, ['items'] as const),
) {}

export class UpdateOrderDto extends UpdateOrderBaseDto {
  @ApiPropertyOptional({ type: [UpdateOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}