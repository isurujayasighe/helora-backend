import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppConfigService } from '../config/app-config.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RegisterUserHandler } from './commands/handlers/register-user.handler';
import { LoginUserHandler } from './commands/handlers/login-user.handler';
import { RefreshSessionHandler } from './commands/handlers/refresh-session.handler';
import { LogoutSessionHandler } from './commands/handlers/logout-session.handler';
import { LogoutAllSessionsHandler } from './commands/handlers/logout-all-sessions.handler';
import { GetCurrentUserHandler } from './queries/handlers/get-current-user.handler';
import type { StringValue } from 'ms';

const commandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  RefreshSessionHandler,
  LogoutSessionHandler,
  LogoutAllSessionsHandler,
];

const queryHandlers = [GetCurrentUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
  inject: [AppConfigService],
  useFactory: (config: AppConfigService) => ({
    secret: config.jwtAccessSecret,
    signOptions: {
      expiresIn: config.jwtAccessExpiresIn as StringValue,
    },
  }),
}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [AuthService],
})
export class AuthModule {}
