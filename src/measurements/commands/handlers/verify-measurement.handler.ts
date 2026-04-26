import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { VerifyMeasurementCommand } from '../impl/verify-measurement.command';

@CommandHandler(VerifyMeasurementCommand)
export class VerifyMeasurementHandler
  implements ICommandHandler<VerifyMeasurementCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: VerifyMeasurementCommand) {
    const data = await this.measurementsService.verifyMeasurement({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Measurement verification updated successfully',
      data,
    };
  }
}
