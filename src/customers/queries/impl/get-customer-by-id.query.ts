import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class GetCustomerByIdQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly id: string,
  ) {}
}
