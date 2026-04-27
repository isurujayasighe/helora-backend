import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { UpdateAttendanceDeviceCommand } from '../impl/update-attendance-device.command';

@CommandHandler(UpdateAttendanceDeviceCommand)
export class UpdateAttendanceDeviceHandler implements ICommandHandler<UpdateAttendanceDeviceCommand> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(command: UpdateAttendanceDeviceCommand) {
    const data = await this.attendanceService.updateDevice({ id: command.id, tenantId: command.currentUser.tenantId, actorUserId: command.currentUser.userId, ...command.payload });

    return {
      success: true,
      message: 'Attendance device updated successfully',
      data,
    };
  }
}
