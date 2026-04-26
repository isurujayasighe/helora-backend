import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { CreateMeasurementCommand } from '../impl/create-measurement.command';

@CommandHandler(CreateMeasurementCommand)
export class CreateMeasurementHandler
  implements ICommandHandler<CreateMeasurementCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: CreateMeasurementCommand) {
    const data = await this.measurementsService.createMeasurement({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Measurement created successfully',
      data,
    };
  }
}
