import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../impl/register-user.command';
import { AuthService } from '../../auth.service';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RegisterUserCommand) {
    const result = await this.authService.register(command.payload);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: result.user.id,
        email: result.user.email,
        tenantId: result.tenant.id,
      },
    };
  }
}
