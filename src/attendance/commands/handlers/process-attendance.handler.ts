import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ProcessAttendanceCommand } from '../impl/process-attendance.command';

@CommandHandler(ProcessAttendanceCommand)
export class ProcessAttendanceHandler implements ICommandHandler<ProcessAttendanceCommand> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(command: ProcessAttendanceCommand) {
    const data = await this.attendanceService.processAttendanceDate({ tenantId: command.currentUser.tenantId, actorUserId: command.currentUser.userId, ...command.payload });

    return {
      success: true,
      message: 'Attendance processed successfully',
      data,
    };
  }
}
