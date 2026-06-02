import { Controller, InternalServerErrorException } from '@nestjs/common';
import {
  AdminSession,
  AuthServiceController,
  AuthServiceControllerMethods,
  ChangePasswordRequest,
  EmailRequest,
  GetUserSessionsRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutUserSessionRequest,
  LogoutUserSessionsByAdminRequest,
  RefreshTokensRequest,
  RegistrateRequest,
  RegistrationResponse,
  TextMessageResponse,
  TokensResponse,
  UserSession,
  UserSessionsResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  AdminSessionsResponse,
  AuthDataResponse,
  GetAuthDataByUserIdRequest,
} from '@noildm/contracts/dist/gen/auth';
import { Empty } from '@noildm/contracts/dist/gen/google/protobuf/empty';
import { AdminFacade } from '../../admin/admin.facade';
import { AuthFacade } from '../../auth/auth.facade';
import { PasswordFacade } from '../../password/password.facade';
import { RegistrationFacade } from '../../registration/registration.facade';
import { SessionFacade } from '../../session/session.facade';
import { Observable } from 'rxjs';
import { toGrpcAuthMapper } from '../mappers/auth-data.mapper';

@Controller()
@AuthServiceControllerMethods()
export class AuthGrpcController implements AuthServiceController {
  constructor(
    private readonly adminFacade: AdminFacade,
    private readonly authFacade: AuthFacade,
    private readonly passwordFacade: PasswordFacade,
    private readonly registrationFacade: RegistrationFacade,
    private readonly sessionFacade: SessionFacade,
  ) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    console.log(request);

    const result = await this.authFacade.login(
      { email: request.email, password: request.password },
      request.token,
      request.sessionData,
    );

    return {
      message: result.message,
      user: result.user,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    };
  }

  async refreshTokens(request: RefreshTokensRequest): Promise<TokensResponse> {
    console.log(request);

    const result = await this.authFacade.refreshTokens(
      request.token,
      request.sessionData,
    );

    return {
      message: result.message,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    };
  }

  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    console.log(request);

    const result = await this.authFacade.logout(request.token, request.jti);

    return {
      clearRefreshCookie: result.clear_refresh_cookie,
      message: result.message,
    };
  }

  async registrate(request: RegistrateRequest): Promise<RegistrationResponse> {
    console.log(request);

    const result = await this.registrationFacade.registrate({
      email: request.email,
      userName: request.userName,
      password: request.password,
    });

    return {
      email: result.email,
      expiresTime: this.toMillis(result.expiresTime),
      message: result.message,
    };
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    console.log(request);

    const result = await this.registrationFacade.verifyEmail(
      { email: request.email, confirmCode: request.confirmCode },
      request.sessionData,
    );

    return {
      user: result.user,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    };
  }

  async getNewVerificationCode(
    request: EmailRequest,
  ): Promise<RegistrationResponse> {
    console.log(request);

    const result = await this.registrationFacade.getNewVerificationCode(
      request.email,
    );

    return {
      email: result.email,
      expiresTime: this.toMillis(result.expiresTime),
      message: result.message,
    };
  }

  async changePassword(
    request: ChangePasswordRequest,
  ): Promise<TextMessageResponse> {
    console.log(request);

    return this.passwordFacade.changePassword(request.userId, {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword,
    });
  }

  async getTempPassword(request: EmailRequest): Promise<TextMessageResponse> {
    console.log(request);

    return this.passwordFacade.getTempPass(request.email);
  }

  async getUserSessions(
    request: GetUserSessionsRequest,
  ): Promise<UserSessionsResponse> {
    console.log(request);

    const result = await this.sessionFacade.getUserSessions(request.token);
    return {
      data: result.data.map(
        (session): UserSession => ({
          deviceId: session.deviceId,
          session: session.session,
        }),
      ),
    };
  }

  async logoutUserSession(
    request: LogoutUserSessionRequest,
  ): Promise<TextMessageResponse> {
    console.log(request);

    return this.sessionFacade.logoutSession(request.token, request.deviceId);
  }

  async getAllSessionsByAdmin(_: Empty): Promise<AdminSessionsResponse> {
    const result = await this.adminFacade.getAllSessionsByAdmin();
    return {
      data: result.data.map((session): AdminSession => {
        if (!session.userId) {
          throw new InternalServerErrorException(
            'Session record has no userId',
          );
        }

        return {
          userId: session.userId,
          deviceId: session.deviceId,
          session: session.session,
        };
      }),
    };
  }

  async logoutUserSessionsByAdmin(
    request: LogoutUserSessionsByAdminRequest,
  ): Promise<TextMessageResponse> {
    console.log(request);

    return this.adminFacade.logoutUserSessionsByAdmin(request.userId);
  }

  async getAuthDataByUserId(
    request: GetAuthDataByUserIdRequest,
  ): Promise<AuthDataResponse> {
    return toGrpcAuthMapper(
      await this.adminFacade.getAuthDataByUserId(request.userId),
    );
  }

  async logoutAllSessionsByAdmin(_: Empty): Promise<TextMessageResponse> {
    return this.adminFacade.logoutAllSessionsByAdmin();
  }

  private toMillis(value: number | Date): number {
    if (typeof value === 'number') return value;
    return value.getTime();
  }
}
