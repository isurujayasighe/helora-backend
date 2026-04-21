import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshSessionCommand } from '../impl/refresh-session.command';
import { AuthService } from '../../auth.service';

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler implements ICommandHandler<RefreshSessionCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshSessionCommand) {
    const refreshToken = command.request.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie is missing');
    }

    const result = await this.authService.refreshSession(refreshToken);
    this.authService.setRefreshCookie(command.response, result.refreshToken);

    return {
      success: true,
      message: 'Session refreshed successfully',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }
}
