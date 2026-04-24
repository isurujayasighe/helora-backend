import { CurrentUserContext } from "../../../common/types/current-user-context.type";

export class FindCustomerByPhoneQuery {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly phoneNumber: string,
  ) {}
}
