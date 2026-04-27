import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ImportAttendanceLogsDto } from '../../dto/import-attendance-logs.dto';

export class ImportAttendanceLogsCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: ImportAttendanceLogsDto,
  ) {}
}
