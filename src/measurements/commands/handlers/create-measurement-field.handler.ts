import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MeasurementsService } from '../../measurements.service';
import { CreateMeasurementFieldCommand } from '../impl/create-measurement-field.command';

@CommandHandler(CreateMeasurementFieldCommand)
export class CreateMeasurementFieldHandler
  implements ICommandHandler<CreateMeasurementFieldCommand>
{
  constructor(private readonly measurementsService: MeasurementsService) {}

  async execute(command: CreateMeasurementFieldCommand) {
    const data = await this.measurementsService.createMeasurementField({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Measurement field created successfully',
      data,
    };
  }
}
