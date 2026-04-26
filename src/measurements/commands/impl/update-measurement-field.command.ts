import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateMeasurementFieldDto } from '../../dto/update-measurement-field.dto';

export class UpdateMeasurementFieldCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateMeasurementFieldDto,
  ) {}
}
