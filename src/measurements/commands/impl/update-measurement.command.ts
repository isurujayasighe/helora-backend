import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateMeasurementDto } from '../../dto/update-measurement.dto';

export class UpdateMeasurementCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateMeasurementDto,
  ) {}
}
