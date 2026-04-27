import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ListAttendanceLogsQuery } from '../impl/list-attendance-logs.query';

@QueryHandler(ListAttendanceLogsQuery)
export class ListAttendanceLogsHandler implements IQueryHandler<ListAttendanceLogsQuery> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(query: ListAttendanceLogsQuery) {
    const result = await this.attendanceService.listLogs({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return { success: true, data: result };
  }
}
