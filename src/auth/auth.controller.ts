import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserContext } from '../common/types/current-user-context.type';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterUserCommand } from './commands/impl/register-user.command';
import { LoginUserCommand } from './commands/impl/login-user.command';
import { RefreshSessionCommand } from './commands/impl/refresh-session.command';
import { LogoutSessionCommand } from './commands/impl/logout-session.command';
import { LogoutAllSessionsCommand } from './commands/impl/logout-all-sessions.command';
import { GetCurrentUserQuery } from './queries/impl/get-current-user.query';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Version('1')
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Public()
  @Version('1')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() _body: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.commandBus.execute(new LoginUserCommand(request, response));
  }

  @Public()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.commandBus.execute(new RefreshSessionCommand(request, response));
  }

  @ApiBearerAuth()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() currentUser: CurrentUserContext, @Res({ passthrough: true }) response: Response) {
    return this.commandBus.execute(new LogoutSessionCommand(currentUser, response));
  }

  @ApiBearerAuth()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  async logoutAll(@CurrentUser() currentUser: CurrentUserContext, @Res({ passthrough: true }) response: Response) {
    return this.commandBus.execute(new LogoutAllSessionsCommand(currentUser, response));
  }

  @ApiBearerAuth()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() currentUser: CurrentUserContext) {
    return this.queryBus.execute(new GetCurrentUserQuery(currentUser));
  }
}
