import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateGroupOrderDto } from '../../dto/update-group-order.dto';

export class UpdateGroupOrderCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateGroupOrderDto,
  ) {}
}
