import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutSessionCommand } from '../impl/logout-session.command';
import { AuthService } from '../../auth.service';

@CommandHandler(LogoutSessionCommand)
export class LogoutSessionHandler implements ICommandHandler<LogoutSessionCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LogoutSessionCommand) {
    await this.authService.logout(command.currentUser.sessionId);
    this.authService.clearRefreshCookie(command.response);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
