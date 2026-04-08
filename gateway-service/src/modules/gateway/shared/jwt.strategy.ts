import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type AccessJwtPayload = {
  sub: string;
  authId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  jti: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.getOrThrow('JWT_SECRET') as string,
    });
  }

  async validate(payload: AccessJwtPayload) {
    return {
      sub: payload.sub,
      authId: payload.authId,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
