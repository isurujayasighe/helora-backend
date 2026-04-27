import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListAttendanceLogsDto } from '../../dto/list-attendance-logs.dto';

export class ListAttendanceLogsQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListAttendanceLogsDto,
  ) {}
}
