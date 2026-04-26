import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LatestMeasurementDto {
  @ApiPropertyOptional({ example: 'customer_cuid' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'block_cuid' })
  @IsOptional()
  @IsString()
  blockId?: string;

  @ApiPropertyOptional({ example: 'category_cuid' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
