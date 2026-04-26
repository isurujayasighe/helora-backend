import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlockStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateBlockCustomerDto {
  @ApiProperty({ example: 'customer_cuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateBlockDto {
  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: 'UNI-1001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  blockNumber!: string;

  @ApiPropertyOptional({ example: 'M' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readyMadeSize?: string;

  @ApiPropertyOptional({ example: 'Standard Medium' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sizeLabel?: string;

  @ApiPropertyOptional({ example: 'Uniform block for regular fit' })
  @IsOptional()
  @IsString()
  fitNotes?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  versionNo?: number;

  @ApiPropertyOptional({ example: 'previous_block_cuid' })
  @IsOptional()
  @IsString()
  previousBlockId?: string;

  @ApiPropertyOptional({ example: 'Sample uniform block' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: BlockStatus.ACTIVE,
    enum: BlockStatus,
  })
  @IsOptional()
  @IsEnum(BlockStatus)
  status?: BlockStatus;

  @ApiPropertyOptional({ example: 'Default uniform block' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ example: 52 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  legacyId?: number;

  @ApiProperty({ type: [CreateBlockCustomerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockCustomerDto)
  customers!: CreateBlockCustomerDto[];
}