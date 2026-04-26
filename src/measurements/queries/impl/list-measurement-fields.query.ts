import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListMeasurementFieldsDto } from '../../dto/list-measurement-fields.dto';

export class ListMeasurementFieldsQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListMeasurementFieldsDto,
  ) {}
}
