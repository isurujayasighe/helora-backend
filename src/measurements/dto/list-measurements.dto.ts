import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  MEASUREMENT_VERIFICATION_STATUSES,
  MeasurementVerificationStatusValue,
} from './measurement-options';

export class ListMeasurementsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'MSR-00001' })
  @IsOptional()
  @IsString()
  search?: string;

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

  @ApiPropertyOptional({ example: 'NOT_VERIFIED', enum: MEASUREMENT_VERIFICATION_STATUSES })
  @IsOptional()
  @IsIn(MEASUREMENT_VERIFICATION_STATUSES)
  verificationStatus?: MeasurementVerificationStatusValue;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
