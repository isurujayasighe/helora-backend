import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBlockDto {
  @ApiProperty({ example: 'customer_cuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: '34-35-B-6' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  blockNumber!: string;

  @ApiPropertyOptional({ example: 'Blouse block' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ example: 'Migrated from old system' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

  @ApiPropertyOptional({ example: 52 })
  @IsOptional()
  @IsInt()
  legacyId?: number;
}
