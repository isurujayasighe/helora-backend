import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { UpdateMeasurementCommand } from '../impl/update-measurement.command';

@CommandHandler(UpdateMeasurementCommand)
export class UpdateMeasurementHandler
  implements ICommandHandler<UpdateMeasurementCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: UpdateMeasurementCommand) {
    const data = await this.measurementsService.updateMeasurement({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Measurement updated successfully',
      data,
    };
  }
}
