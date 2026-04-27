import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ManualAttendanceRecordCommand } from '../impl/manual-attendance-record.command';

@CommandHandler(ManualAttendanceRecordCommand)
export class ManualAttendanceRecordHandler implements ICommandHandler<ManualAttendanceRecordCommand> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(command: ManualAttendanceRecordCommand) {
    const data = await this.attendanceService.upsertManualRecord({ tenantId: command.currentUser.tenantId, actorUserId: command.currentUser.userId, ...command.payload });

    return {
      success: true,
      message: 'Attendance record saved successfully',
      data,
    };
  }
}
