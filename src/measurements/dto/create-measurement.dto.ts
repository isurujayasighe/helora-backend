import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MEASUREMENT_VERIFICATION_STATUSES,
  MeasurementVerificationStatusValue,
} from './measurement-options';

export class CreateMeasurementValueDto {
  @ApiProperty({ example: 'measurement_field_cuid' })
  @IsString()
  @IsNotEmpty()
  fieldId!: string;

  @ApiPropertyOptional({ example: '34.5' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiPropertyOptional({ example: 34.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  numericValue?: number;

  @ApiPropertyOptional({ example: 'Customer said slightly loose fit' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateMeasurementDto {
  @ApiProperty({ example: 'customer_cuid' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'block_cuid' })
  @IsString()
  @IsNotEmpty()
  blockId!: string;

  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'MSR-00001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  measurementNumber?: string;

  @ApiPropertyOptional({ example: 'NOT_VERIFIED', enum: MEASUREMENT_VERIFICATION_STATUSES })
  @IsOptional()
  @IsIn(MEASUREMENT_VERIFICATION_STATUSES)
  verificationStatus?: MeasurementVerificationStatusValue;

  @ApiPropertyOptional({ example: 'Previous measurement confirmed by phone' })
  @IsOptional()
  @IsString()
  verificationNote?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  versionNo?: number;

  @ApiPropertyOptional({ example: 'previous_measurement_cuid' })
  @IsOptional()
  @IsString()
  previousMeasurementId?: string;

  @ApiPropertyOptional({ example: 'Customer requested normal fit' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateMeasurementValueDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMeasurementValueDto)
  values!: CreateMeasurementValueDto[];
}
