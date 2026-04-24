import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { ListOrdersDto } from '../../dto/list-orders.dto';

export class ListOrdersQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: Omit<ListOrdersDto, 'page' | 'pageSize'>,
    public readonly page: number = 1,
    public readonly pageSize: number = 10,
  ) {}
}