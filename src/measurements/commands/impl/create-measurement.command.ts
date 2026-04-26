import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateMeasurementDto } from '../../dto/create-measurement.dto';

export class CreateMeasurementCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateMeasurementDto,
  ) {}
}
