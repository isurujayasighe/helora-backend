import { Response } from 'express';
import { CurrentUserContext } from '../../../common/types/current-user-context.type';

export class LogoutSessionCommand {
  constructor(
    public readonly currentUser: CurrentUserContext,
    public readonly response: Response,
  ) {}
}
