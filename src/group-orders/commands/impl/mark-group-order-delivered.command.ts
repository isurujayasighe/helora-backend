import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { MarkGroupOrderDeliveredDto } from '../../dto/mark-group-order-delivered.dto';

export class MarkGroupOrderDeliveredCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: MarkGroupOrderDeliveredDto,
  ) {}
}
