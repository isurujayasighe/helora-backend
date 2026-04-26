import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListGroupOrdersDto } from '../../dto/list-group-orders.dto';

export class ListGroupOrdersQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: ListGroupOrdersDto,
  ) {}
}
