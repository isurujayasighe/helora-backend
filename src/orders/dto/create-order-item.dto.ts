import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'block_cuid' })
  @IsOptional()
  @IsString()
  blockId?: string;

  @ApiPropertyOptional({ example: '2 uniforms' })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;

  @ApiPropertyOptional({ example: 1250 })
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  lineTotal?: number;

  @ApiPropertyOptional({ example: 'Urgent item' })
  @IsOptional()
  @IsString()
  notes?: string;
}
