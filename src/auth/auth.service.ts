import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Response } from 'express';
import { AuditAction } from '@prisma/client';
import type { StringValue } from 'ms';
import { AppConfigService } from '../config/app-config.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { SessionsService } from '../sessions/sessions.service';
import { AuditService } from '../audit/audit.service';
import { CurrentUserContext } from '../common/types/current-user-context.type';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly sessionsService: SessionsService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantSlug: string;
  }) {
    const existing = await this.usersService.findByEmail(params.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await argon2.hash(params.password);
    const { user, tenant } = await this.usersService.createUser({
      ...params,
      passwordHash,
    });

    await this.auditService.log({
      tenantId: tenant.id,
      actorUserId: user.id,
      action: AuditAction.CREATE,
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email },
    });

    return { user, tenant };
  }

  async issueSession(params: {
    userId: string;
    tenantId: string;
    email: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const authorization = await this.rolesService.getUserAuthorization(
      params.userId,
      params.tenantId,
    );

    if (!authorization) {
      throw new UnauthorizedException('No active tenant membership found');
    }

    const refreshExpiryDate = this.calculateRefreshExpiryDate();

    const temporaryRefreshToken = this.jwtService.sign(
      { sub: params.userId, tenantId: params.tenantId, email: params.email },
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpiresIn as StringValue,
      },
    );

    const session = await this.sessionsService.createSession({
      userId: params.userId,
      refreshToken: temporaryRefreshToken,
      expiresAt: refreshExpiryDate,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });

    const accessPayload: CurrentUserContext = {
      userId: params.userId,
      email: params.email,
      tenantId: params.tenantId,
      sessionId: session.id,
      roles: authorization.roles,
      permissions: authorization.permissions,
    };

    const accessToken = this.buildAccessToken(accessPayload);

    const refreshToken = this.jwtService.sign(
      {
        sub: params.userId,
        sessionId: session.id,
        tenantId: params.tenantId,
        email: params.email,
      },
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpiresIn as StringValue,
      },
    );

    await this.sessionsService.rotateRefreshToken(
      session.id,
      refreshToken,
      refreshExpiryDate,
    );

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      user: {
        id: params.userId,
        email: params.email,
        tenantId: params.tenantId,
        roles: authorization.roles,
        permissions: authorization.permissions,
      },
    };
  }

  async refreshSession(refreshToken: string) {
    let payload: {
      sub: string;
      sessionId: string;
      tenantId: string;
      email: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionsService.verifyRefreshToken(
      payload.sessionId,
      refreshToken,
    );

    if (!session) {
      throw new UnauthorizedException('Refresh session is invalid or expired');
    }

    const authorization = await this.rolesService.getUserAuthorization(
      payload.sub,
      payload.tenantId,
    );

    if (!authorization) {
      throw new UnauthorizedException('No active tenant membership found');
    }

    const refreshExpiryDate = this.calculateRefreshExpiryDate();

    const nextRefreshToken = this.jwtService.sign(
      {
        sub: payload.sub,
        sessionId: session.id,
        tenantId: payload.tenantId,
        email: payload.email,
      },
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpiresIn as StringValue,
      },
    );

    await this.sessionsService.rotateRefreshToken(
      session.id,
      nextRefreshToken,
      refreshExpiryDate,
    );

    const accessToken = this.buildAccessToken({
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      sessionId: session.id,
      roles: authorization.roles,
      permissions: authorization.permissions,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      sessionId: session.id,
      user: {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: authorization.roles,
        permissions: authorization.permissions,
      },
    };
  }

  async logout(sessionId: string) {
    await this.sessionsService.revokeSession(sessionId);
  }

  async logoutAll(userId: string) {
    await this.sessionsService.revokeAllForUser(userId);
  }

  async getCurrentUser(userId: string, tenantId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const authorization = await this.rolesService.getUserAuthorization(
      userId,
      tenantId,
    );

    if (!authorization) {
      throw new UnauthorizedException('No authorization context found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      tenantId,
      roles: authorization.roles,
      permissions: authorization.permissions,
    };
  }

  setRefreshCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: 'lax',
      domain:
        this.config.cookieDomain === 'localhost'
          ? undefined
          : this.config.cookieDomain,
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearRefreshCookie(response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: 'lax',
      domain:
        this.config.cookieDomain === 'localhost'
          ? undefined
          : this.config.cookieDomain,
      path: '/api/v1/auth/refresh',
    });
  }

  private buildAccessToken(payload: CurrentUserContext) {
    return this.jwtService.sign(payload, {
      secret: this.config.jwtAccessSecret,
      expiresIn: this.config.jwtAccessExpiresIn as StringValue,
    });
  }

  private calculateRefreshExpiryDate() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}