import { AuthTokenService } from '@/modules/gateway/shared/auth-token.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authToken: AuthTokenService) {
    super();
  }
  getRequest(context: ExecutionContext) {
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      return gqlCtx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request = this.getRequest(context);
    const jti = request?.user?.jti;

    await this.authToken.assertAccessTokenNotRevoked(jti);
    return true;
  }
}
