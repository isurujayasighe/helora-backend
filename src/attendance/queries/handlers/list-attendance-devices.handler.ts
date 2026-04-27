import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AttendanceService } from '../../attendance.service';
import { ListAttendanceDevicesQuery } from '../impl/list-attendance-devices.query';

@QueryHandler(ListAttendanceDevicesQuery)
export class ListAttendanceDevicesHandler implements IQueryHandler<ListAttendanceDevicesQuery> {
  constructor(private readonly attendanceService: AttendanceService) {}

  async execute(query: ListAttendanceDevicesQuery) {
    const result = await this.attendanceService.listDevices({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return { success: true, data: result };
  }
}
