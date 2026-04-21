import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class GetCurrentUserQuery {
  constructor(public readonly currentUser: CurrentUserContext) {}
}
