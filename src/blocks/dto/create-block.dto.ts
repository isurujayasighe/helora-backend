import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockCustomerAssignmentDto {
  @ApiProperty({ example: 'customer_cuid_1' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiPropertyOptional({ example: true, default: false })
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

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  versionNo?: number;

  @ApiPropertyOptional({ example: 'previous_block_cuid' })
  @IsOptional()
  @IsString()
  previousBlockId?: string;

  @ApiPropertyOptional({ example: 'Sample uniform block' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Default uniform block' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ example: 52 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  legacyId?: number;

  @ApiProperty({ type: [CreateBlockCustomerAssignmentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBlockCustomerAssignmentDto)
  customers!: CreateBlockCustomerAssignmentDto[];
}