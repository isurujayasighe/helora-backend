import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListAttendanceDevicesDto } from '../../dto/list-attendance-devices.dto';

export class ListAttendanceDevicesQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListAttendanceDevicesDto,
  ) {}
}
