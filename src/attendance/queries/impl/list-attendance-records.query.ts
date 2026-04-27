import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListAttendanceRecordsDto } from '../../dto/list-attendance-records.dto';

export class ListAttendanceRecordsQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListAttendanceRecordsDto,
  ) {}
}
