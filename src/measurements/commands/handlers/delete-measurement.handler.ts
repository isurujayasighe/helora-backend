import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { DeleteMeasurementCommand } from '../impl/delete-measurement.command';

@CommandHandler(DeleteMeasurementCommand)
export class DeleteMeasurementHandler
  implements ICommandHandler<DeleteMeasurementCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: DeleteMeasurementCommand) {
    await this.measurementsService.deleteMeasurement({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
    });

    return {
      success: true,
      message: 'Measurement deleted successfully',
    };
  }
}
