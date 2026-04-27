import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateAttendanceDeviceDto } from '../../dto/update-attendance-device.dto';

export class UpdateAttendanceDeviceCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateAttendanceDeviceDto,
  ) {}
}
