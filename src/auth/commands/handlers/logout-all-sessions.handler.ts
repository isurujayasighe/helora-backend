import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutAllSessionsCommand } from '../impl/logout-all-sessions.command';
import { AuthService } from '../../auth.service';

@CommandHandler(LogoutAllSessionsCommand)
export class LogoutAllSessionsHandler implements ICommandHandler<LogoutAllSessionsCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LogoutAllSessionsCommand) {
    await this.authService.logoutAll(command.currentUser.sub);
    this.authService.clearRefreshCookie(command.response);

    return {
      success: true,
      message: 'All sessions revoked successfully',
    };
  }
}
