import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@noildm/contracts/dist/gen/auth';
import { FacadePort } from './facade.port';
import { LoginDto } from '../../controllers/DTO/requests/login.dto';
import { ChangePassDto } from '../../controllers/DTO/requests/changePass.dto';
import { VerifyDto } from '../../controllers/DTO/requests/verify.dto';
import { RegistrateDto } from '../../controllers/DTO/requests/registrate.dto';
import { SessionDataDto } from '../../controllers/DTO/requests/sessionData.dto';

@Injectable()
export class FacadeAdapter implements OnModuleInit, FacadePort {
  private authService: AuthServiceClient;

  public constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  public registrate(dto: RegistrateDto) {
    return firstValueFrom(this.authService.registrate(dto));
  }

  public login(dto: LoginDto, token: string, sessionData: SessionDataDto) {
    return firstValueFrom(
      this.authService.login({
        email: dto.email,
        password: dto.password,
        token,
        sessionData,
      }),
    );
  }

  public refreshTokens(token: string, sessionData: SessionDataDto) {
    return firstValueFrom(this.authService.refreshTokens({ token, sessionData }));
  }

  public logout(token: string, jti: string) {
    return firstValueFrom(this.authService.logout({ token, jti }));
  }

  public verifyEmail(dto: VerifyDto, sessionData: SessionDataDto) {
    return firstValueFrom(
      this.authService.verifyEmail({
        email: dto.email,
        confirmCode: dto.confirmCode,
        sessionData,
      }),
    );
  }

  public getNewVerificationCode(email: string) {
    return firstValueFrom(this.authService.getNewVerificationCode({ email }));
  }

  public changePassword(userId: number | string, dto: ChangePassDto) {
    return firstValueFrom(
      this.authService.changePassword({
        userId: String(userId),
        oldPassword: dto.oldPassword,
        newPassword: dto.newPassword,
      }),
    );
  }

  public getTempPass(email: string) {
    return firstValueFrom(this.authService.getTempPassword({ email }));
  }

  public getUserSessions(token: string) {
    return firstValueFrom(this.authService.getUserSessions({ token }));
  }

  public logoutSession(token: string, deviceId: string) {
    return firstValueFrom(this.authService.logoutUserSession({ token, deviceId }));
  }

  public getAllSessionsByAdmin() {
    return firstValueFrom(this.authService.getAllSessionsByAdmin({}));
  }

  public logoutUserSessionsByAdmin(userId: number | string) {
    return firstValueFrom(
      this.authService.logoutUserSessionsByAdmin({ userId: String(userId) }),
    );
  }

  public logoutAllSessionsByAdmin() {
    return firstValueFrom(this.authService.logoutAllSessionsByAdmin({}));
  }
}
