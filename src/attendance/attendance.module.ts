import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDeviceHandler } from './commands/handlers/create-attendance-device.handler';
import { ImportAttendanceLogsHandler } from './commands/handlers/import-attendance-logs.handler';
import { ManualAttendanceRecordHandler } from './commands/handlers/manual-attendance-record.handler';
import { ProcessAttendanceHandler } from './commands/handlers/process-attendance.handler';
import { UpdateAttendanceDeviceHandler } from './commands/handlers/update-attendance-device.handler';
import { ListAttendanceDevicesHandler } from './queries/handlers/list-attendance-devices.handler';
import { ListAttendanceLogsHandler } from './queries/handlers/list-attendance-logs.handler';
import { ListAttendanceRecordsHandler } from './queries/handlers/list-attendance-records.handler';

const CommandHandlers = [
  CreateAttendanceDeviceHandler,
  UpdateAttendanceDeviceHandler,
  ImportAttendanceLogsHandler,
  ManualAttendanceRecordHandler,
  ProcessAttendanceHandler,
];

const QueryHandlers = [
  ListAttendanceDevicesHandler,
  ListAttendanceLogsHandler,
  ListAttendanceRecordsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, ...CommandHandlers, ...QueryHandlers],
  exports: [AttendanceService],
})
export class AttendanceModule {}
