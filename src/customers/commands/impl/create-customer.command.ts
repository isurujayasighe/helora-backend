import { CurrentUserContext } from '../../../common/types/current-user-context.type';
import { CreateCustomerDto } from '../../dto/create-customer.dto';

export class CreateCustomerCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly payload: CreateCustomerDto,
  ) {}
}
