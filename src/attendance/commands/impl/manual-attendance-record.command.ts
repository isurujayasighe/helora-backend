import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ManualAttendanceRecordDto } from '../../dto/manual-attendance-record.dto';

export class ManualAttendanceRecordCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: ManualAttendanceRecordDto,
  ) {}
}
