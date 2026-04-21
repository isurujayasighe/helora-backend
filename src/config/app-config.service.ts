import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.getOrThrow<number>('port');
  }

  get appOrigin(): string {
    return this.configService.getOrThrow<string>('appOrigin');
  }

  get nodeEnv(): string {
    return this.configService.getOrThrow<string>('nodeEnv');
  }

  get jwtAccessSecret(): string {
    return this.configService.getOrThrow<string>('jwtAccessSecret');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('jwtRefreshSecret');
  }

  get jwtAccessExpiresIn(): string {
    return this.configService.getOrThrow<string>('jwtAccessExpiresIn');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.getOrThrow<string>('jwtRefreshExpiresIn');
  }

  get cookieDomain(): string {
    return this.configService.getOrThrow<string>('cookieDomain');
  }

  get cookieSecure(): boolean {
    return this.configService.get<boolean>('cookieSecure', false);
  }
}
