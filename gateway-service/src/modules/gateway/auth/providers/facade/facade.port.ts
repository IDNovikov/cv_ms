import {
  AdminSessionsResponse,
  LoginResponse,
  LogoutResponse,
  RegistrationResponse,
  TextMessageResponse,
  TokensResponse,
  UserSessionsResponse,
  VerifyEmailResponse,
} from '@noildm/contracts/dist/gen/auth';
import { LoginDto } from '../../controllers/DTO/requests/login.dto';
import { ChangePassDto } from '../../controllers/DTO/requests/changePass.dto';
import { VerifyDto } from '../../controllers/DTO/requests/verify.dto';
import { RegistrateDto } from '../../controllers/DTO/requests/registrate.dto';
import { SessionDataDto } from '../../controllers/DTO/requests/sessionData.dto';

export abstract class FacadePort {
  abstract getUserSessions(token: string): Promise<UserSessionsResponse>;

  abstract logoutSession(
    token: string,
    deviceId: string,
  ): Promise<TextMessageResponse>;

  abstract registrate(dto: RegistrateDto): Promise<RegistrationResponse>;
  abstract verifyEmail(
    dto: VerifyDto,
    sessionData: SessionDataDto,
  ): Promise<VerifyEmailResponse>;

  abstract getNewVerificationCode(email: string): Promise<RegistrationResponse>;

  abstract changePassword(
    userId: number | string,
    dto: ChangePassDto,
  ): Promise<TextMessageResponse>;

  abstract getTempPass(email: string): Promise<TextMessageResponse>;

  abstract login(
    dto: LoginDto,
    token: string,
    sessionData: SessionDataDto,
  ): Promise<LoginResponse>;

  abstract refreshTokens(
    token: string,
    sessionData: SessionDataDto,
  ): Promise<TokensResponse>;

  abstract logout(token: string, jti: string): Promise<LogoutResponse>;

  abstract getAllSessionsByAdmin(): Promise<AdminSessionsResponse>;

  abstract logoutUserSessionsByAdmin(
    userId: number | string,
  ): Promise<TextMessageResponse>;

  abstract logoutAllSessionsByAdmin(): Promise<TextMessageResponse>;
}
