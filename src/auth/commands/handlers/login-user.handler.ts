import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserCommand } from '../impl/login-user.command';
import { AuthService } from '../../auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { getClientIp } from '../../../common/utils/request.util';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: LoginUserCommand) {
    const user = command.request.user as { id: string; email: string } | undefined;
    if (!user) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    const tenantId =
      (command.request.body as { tenantId?: string }).tenantId ??
      (
        await this.prisma.membership.findFirst({
          where: { userId: user.id, isActive: true },
          orderBy: { createdAt: 'asc' },
        })
      )?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('No active tenant found for user');
    }

    const result = await this.authService.issueSession({
      userId: user.id,
      email: user.email,
      tenantId,
      userAgent: command.request.headers['user-agent'],
      ipAddress: getClientIp(command.request),
    });

    this.authService.setRefreshCookie(command.response, result.refreshToken);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }
}
