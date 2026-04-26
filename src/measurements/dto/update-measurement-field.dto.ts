import { PartialType } from '@nestjs/swagger';
import { CreateMeasurementFieldDto } from './create-measurement-field.dto';

export class UpdateMeasurementFieldDto extends PartialType(
  CreateMeasurementFieldDto,
) {}
