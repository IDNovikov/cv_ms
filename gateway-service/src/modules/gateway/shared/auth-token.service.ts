import { RedisService } from '@/modules/core/redis/redis.service';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

export type AccessJwtPayload = {
  sub: string;
  authId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  jti: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  extractBearer(value?: string): string | undefined {
    if (!value) return;
    const match = value.match(/^Bearer\s+(.+)$/i);
    return match?.[1];
  }

  normalizeAccessPayload(payload: AccessJwtPayload): AccessJwtPayload {
    if (!payload.sub || !payload.authId || !payload.email || !payload.role || !payload.jti) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    return {
      sub: payload.sub,
      authId: payload.authId,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
    };
  }

  async assertAccessTokenNotRevoked(jti: string): Promise<void> {
    if (!jti) throw new ForbiddenException('No provided token');

    const isBlocked = await this.redis.get(`blacklist:${jti}`);
    if (isBlocked) {
      throw new ForbiddenException('Token has been revoked');
    }
  }

  async verifyAccessToken(token: string): Promise<AccessJwtPayload> {
    const payload = this.verifyAccessTokenSignature(token);
    await this.assertAccessTokenNotRevoked(payload.jti);
    return payload;
  }

  private verifyAccessTokenSignature(token: string): AccessJwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Malformed access token');
    }

    const header = this.decodeJwtSegment<{ alg?: string }>(encodedHeader);
    if (header.alg !== 'HS256') {
      throw new UnauthorizedException('Unsupported access token algorithm');
    }

    const secret = this.config.getOrThrow<string>('JWT_SECRET');
    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!this.safeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid access token signature');
    }

    const payload = this.normalizeAccessPayload(
      this.decodeJwtSegment<AccessJwtPayload>(encodedPayload),
    );

    if (!payload.exp) {
      throw new UnauthorizedException('Access token expiration is missing');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new UnauthorizedException('Access token expired');
    }

    return payload;
  }

  private decodeJwtSegment<T>(segment: string): T {
    try {
      return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
    } catch {
      throw new UnauthorizedException('Invalid access token encoding');
    }
  }

  private safeEqual(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
  }
}
