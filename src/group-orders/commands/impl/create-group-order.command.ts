import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateGroupOrderDto } from '../../dto/create-group-order.dto';

export class CreateGroupOrderCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateGroupOrderDto,
  ) {}
}
