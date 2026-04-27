import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateAttendanceDeviceDto } from '../../dto/create-attendance-device.dto';

export class CreateAttendanceDeviceCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateAttendanceDeviceDto,
  ) {}
}
