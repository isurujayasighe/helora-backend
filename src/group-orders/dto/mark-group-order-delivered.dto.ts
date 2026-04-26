import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MarkGroupOrderDeliveredDto {
  @ApiPropertyOptional({ example: 'Delivered to coordinator.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
