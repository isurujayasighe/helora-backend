import { CustomerLookupDto } from 'src/customers/dto/customer-lookup-dto';
import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class CustomerLookupQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly filters: CustomerLookupDto,
  ) {}
}