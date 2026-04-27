import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ImportAttendanceLogsCommand } from '../impl/import-attendance-logs.command';

@CommandHandler(ImportAttendanceLogsCommand)
export class ImportAttendanceLogsHandler implements ICommandHandler<ImportAttendanceLogsCommand> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(command: ImportAttendanceLogsCommand) {
    const data = await this.attendanceService.importLogs({ tenantId: command.currentUser.tenantId, actorUserId: command.currentUser.userId, ...command.payload });

    return {
      success: true,
      message: 'Attendance logs imported successfully',
      data,
    };
  }
}
