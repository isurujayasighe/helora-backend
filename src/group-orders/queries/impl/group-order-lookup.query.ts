import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { GroupOrderLookupDto } from '../../dto/group-order-lookup.dto';

export class GroupOrderLookupQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: GroupOrderLookupDto,
  ) {}
}
