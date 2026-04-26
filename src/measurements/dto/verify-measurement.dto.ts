import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  MEASUREMENT_VERIFICATION_STATUSES,
  MeasurementVerificationStatusValue,
} from './measurement-options';

export class VerifyMeasurementDto {
  @ApiPropertyOptional({ example: 'VERIFIED_OK', enum: MEASUREMENT_VERIFICATION_STATUSES })
  @IsOptional()
  @IsIn(MEASUREMENT_VERIFICATION_STATUSES)
  verificationStatus?: MeasurementVerificationStatusValue;

  @ApiPropertyOptional({ example: 'Customer confirmed previous measurements over phone.' })
  @IsOptional()
  @IsString()
  verificationNote?: string;
}
