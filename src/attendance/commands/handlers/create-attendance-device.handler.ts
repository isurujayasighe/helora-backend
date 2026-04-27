import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { CreateAttendanceDeviceCommand } from '../impl/create-attendance-device.command';

@CommandHandler(CreateAttendanceDeviceCommand)
export class CreateAttendanceDeviceHandler implements ICommandHandler<CreateAttendanceDeviceCommand> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(command: CreateAttendanceDeviceCommand) {
    const data = await this.attendanceService.createDevice({ tenantId: command.currentUser.tenantId, actorUserId: command.currentUser.userId, ...command.payload });

    return {
      success: true,
      message: 'Attendance device created successfully',
      data,
    };
  }
}
