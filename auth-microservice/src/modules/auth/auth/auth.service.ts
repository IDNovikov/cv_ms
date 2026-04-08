import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { parseTTL } from '../shared/utils/parseTTL';
import { HashPort } from '../providers/hash/hash.port';
import { UserRpcPort } from '../providers/user-rpc/user-rpc.port';
import { RedisServicePort } from '../providers/redis/redis.port';
import {
  IAccessPayload,
  IRefreshPayload,
  RedisRefreshValue,
  UnionJWTpayload,
} from '../shared/types/auth.types';
import { ISessionData } from '../shared/types/session.types';
import { redisRefreshString } from '../shared/utils/redisRefreshString.utol';
import { JwtService } from '@nestjs/jwt';
import { AuthDBPort } from '../providers/prisma/prisma.port';

@Injectable()
export class AuthService {
  private _access_token_secret;
  private _access_token_expires;
  private _refresh_token_secret;
  private _refresh_token_expires;

  constructor(
    private readonly auth: AuthDBPort,
    private readonly hash: HashPort,
    private readonly redis: RedisServicePort,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {
    this._access_token_secret = this.cfg.get('JWT_SECRET');
    this._access_token_expires = this.cfg.get('JWT_EXPIRES');
    this._refresh_token_secret = this.cfg.get('JWT_REFRESH_SECRET');
    this._refresh_token_expires = this.cfg.get('JWT_REFRESH_EXPIRES');
  }

  async generateAndUpdateTokens(
    { sub, authId, email, role }: UnionJWTpayload,
    sessionData: ISessionData,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const deviceId = randomUUID();
    const jti = randomUUID();

    const accessPayload: IAccessPayload = {
      sub,
      authId,
      email,
      role,
      jti,
    };

    const refreshPayload: IRefreshPayload = {
      sub,
      authId,
      email,
      role,
      deviceId,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this._access_token_secret,
        expiresIn: this._access_token_expires,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this._refresh_token_secret,
        expiresIn: this._refresh_token_expires,
      }),
    ]);

    const hashed = await this.hash.hash(refresh_token);

    const payload: RedisRefreshValue = {
      hash: hashed,
      jti: jti,
      sessionData: sessionData,
      createdAt: Date.now(),
    };
    await this.redis.set(
      redisRefreshString(sub, deviceId),
      payload,
      parseTTL(this._refresh_token_expires),
    );

    return { access_token, refresh_token };
  }

  async validateUser(
    email: string,
    password: string,
    token: string | undefined | null,
  ): Promise<UnionJWTpayload> {
    if (token) throw new ForbiddenException('Delete cookies or refresh tokens');

    const auth = await this.auth.findByEmail(email);
    if (!auth || !auth.email || !auth.password || auth.status !== 'ACTIVE')
      throw new UnauthorizedException('Invalid email');
    const valid = await this.hash.compare(password, auth.password);
    if (!valid) throw new UnauthorizedException('Wrong password');
    return {
      sub: auth.userId,
      authId: auth.id,
      email: auth.email,
      role: auth.role,
    };
  }

  async checkRefreshToken(
    refreshToken: string,
  ): Promise<IRefreshPayload & { jti: string }> {
    const { sub, authId, email, role, deviceId } = await this.jwt.verify(
      refreshToken,
      {
        secret: this._refresh_token_secret,
      },
    );
    const data = await this.redis.get<RedisRefreshValue>(
      redisRefreshString(sub, deviceId),
    );
    if (!data?.hash) throw new ForbiddenException('Mismatch token');
    const match = await this.hash.compare(refreshToken, data?.hash);
    if (!match) throw new ForbiddenException('Invalid refresh token');
    return { sub, authId, email, role, deviceId, jti: data.jti };
  }
}
