import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

type RefreshJwtPayload = {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
  deviceId: string;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies?.refresh_token]),
      secretOrKey: cfg.getOrThrow('JWT_REFRESH_SECRET') as string,
    });
  }
  async validate(payload: RefreshJwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      deviceId: payload.deviceId,
    };
  }
}
