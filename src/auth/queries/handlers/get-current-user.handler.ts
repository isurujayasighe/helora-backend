import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurrentUserQuery } from '../impl/get-current-user.query';
import { AuthService } from '../../auth.service';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly authService: AuthService) {}

  async execute(query: GetCurrentUserQuery) {
    const user = await this.authService.getCurrentUser(
      query.currentUser.sub,
      query.currentUser.tenantId,
    );

    return {
      success: true,
      data: user,
    };
  }
}
