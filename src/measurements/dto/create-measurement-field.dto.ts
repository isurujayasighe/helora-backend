import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  MEASUREMENT_FIELD_INPUT_TYPES,
  MeasurementFieldInputTypeValue,
} from './measurement-options';

export class CreateMeasurementFieldDto {
  @ApiProperty({ example: 'category_cuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: 'chest' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({ example: 'Chest' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  label!: string;

  @ApiPropertyOptional({ example: 'DECIMAL', enum: MEASUREMENT_FIELD_INPUT_TYPES })
  @IsOptional()
  @IsIn(MEASUREMENT_FIELD_INPUT_TYPES)
  inputType?: MeasurementFieldInputTypeValue;

  @ApiPropertyOptional({ example: 'inch' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Measure around chest' })
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiPropertyOptional({ example: ['S', 'M', 'L'] })
  @IsOptional()
  options?: unknown;
}
