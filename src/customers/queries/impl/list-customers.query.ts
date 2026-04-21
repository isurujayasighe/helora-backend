import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListCustomersDto } from '../../dto/list-customers.dto';

export class ListCustomersQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListCustomersDto,
  ) {}
}
