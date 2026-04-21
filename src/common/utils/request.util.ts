import { Request } from 'express';

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim();
  }

  return request.ip;
}
