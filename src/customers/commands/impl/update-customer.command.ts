import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { UpdateCustomerDto } from '../../dto/update-customer.dto';

export class UpdateCustomerCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
    public readonly payload: UpdateCustomerDto,
  ) {}
}
