import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ListAttendanceRecordsQuery } from '../impl/list-attendance-records.query';

@QueryHandler(ListAttendanceRecordsQuery)
export class ListAttendanceRecordsHandler implements IQueryHandler<ListAttendanceRecordsQuery> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(query: ListAttendanceRecordsQuery) {
    const result = await this.attendanceService.listRecords({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return { success: true, data: result };
  }
}
