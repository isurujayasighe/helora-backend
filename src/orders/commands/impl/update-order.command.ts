import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateOrderDto } from '../../dto/update-order.dto';

export class UpdateOrderCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateOrderDto,
  ) {}
}
