import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserContext } from '../types/current-user-context.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserContext => {
    const request = context.switchToHttp().getRequest();
    return request.user as CurrentUserContext;
  },
);
