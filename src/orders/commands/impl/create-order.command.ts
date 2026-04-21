import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateOrderDto } from '../../dto/create-order.dto';

export class CreateOrderCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateOrderDto,
  ) {}
}
