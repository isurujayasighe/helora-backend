import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateMeasurementFieldDto } from '../../dto/create-measurement-field.dto';

export class CreateMeasurementFieldCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateMeasurementFieldDto,
  ) {}
}
