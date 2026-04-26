import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';

import { CreateMeasurementFieldHandler } from './commands/handlers/create-measurement-field.handler';
import { UpdateMeasurementFieldHandler } from './commands/handlers/update-measurement-field.handler';
import { CreateMeasurementHandler } from './commands/handlers/create-measurement.handler';
import { UpdateMeasurementHandler } from './commands/handlers/update-measurement.handler';
import { VerifyMeasurementHandler } from './commands/handlers/verify-measurement.handler';
import { DeleteMeasurementHandler } from './commands/handlers/delete-measurement.handler';

import { ListMeasurementFieldsHandler } from './queries/handlers/list-measurement-fields.handler';
import { ListMeasurementsHandler } from './queries/handlers/list-measurements.handler';
import { GetMeasurementByIdHandler } from './queries/handlers/get-measurement-by-id.handler';
import { GetLatestMeasurementHandler } from './queries/handlers/get-latest-measurement.handler';

const CommandHandlers = [
  CreateMeasurementFieldHandler,
  UpdateMeasurementFieldHandler,
  CreateMeasurementHandler,
  UpdateMeasurementHandler,
  VerifyMeasurementHandler,
  DeleteMeasurementHandler,
];

const QueryHandlers = [
  ListMeasurementFieldsHandler,
  ListMeasurementsHandler,
  GetMeasurementByIdHandler,
  GetLatestMeasurementHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, ...CommandHandlers, ...QueryHandlers],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
