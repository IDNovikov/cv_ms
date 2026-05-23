import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessJwtPayload, AuthTokenService } from './auth-token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    cfg: ConfigService,
    private readonly authToken: AuthTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.getOrThrow('JWT_SECRET') as string,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: AccessJwtPayload) {
    return this.authToken.normalizeAccessPayload(payload);
  }
}
