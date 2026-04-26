import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListMeasurementsDto } from '../../dto/list-measurements.dto';

export class ListMeasurementsQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListMeasurementsDto,
  ) {}
}
