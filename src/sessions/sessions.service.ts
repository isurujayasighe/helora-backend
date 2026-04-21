import { Injectable } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(params: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const refreshTokenHash = await argon2.hash(params.refreshToken);

    return this.prisma.session.create({
      data: {
        userId: params.userId,
        refreshTokenHash,
        expiresAt: params.expiresAt,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
      },
    });
  }

  async verifyRefreshToken(sessionId: string, refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.status !== SessionStatus.ACTIVE) {
      return null;
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: SessionStatus.EXPIRED },
      });
      return null;
    }

    const isValid = await argon2.verify(session.refreshTokenHash, refreshToken);
    return isValid ? session : null;
  }

  async rotateRefreshToken(sessionId: string, refreshToken: string, expiresAt: Date) {
    const refreshTokenHash = await argon2.hash(refreshToken);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });
  }

  async revokeSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllForUser(userId: string) {
    return this.prisma.session.updateMany({
      where: { userId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }
}
