import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { UpdateMeasurementFieldCommand } from '../impl/update-measurement-field.command';

@CommandHandler(UpdateMeasurementFieldCommand)
export class UpdateMeasurementFieldHandler
  implements ICommandHandler<UpdateMeasurementFieldCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: UpdateMeasurementFieldCommand) {
    const data = await this.measurementsService.updateMeasurementField({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Measurement field updated successfully',
      data,
    };
  }
}
