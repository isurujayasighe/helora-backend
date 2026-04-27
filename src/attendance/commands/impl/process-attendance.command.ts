import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ProcessAttendanceDto } from '../../dto/process-attendance.dto';

export class ProcessAttendanceCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: ProcessAttendanceDto,
  ) {}
}
