import { Inject, OnModuleInit } from '@nestjs/common';
import { FacadePort } from './facade.port';
import { USER_SERVICE_NAME, UserServiceClient } from '@noildm/contracts/dist/gen/user';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacadeAdapter implements OnModuleInit, FacadePort {
  private userService: UserServiceClient;

  public constructor(@Inject(USER_SERVICE_NAME) private readonly client: ClientGrpc) {}

  public onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  public getUserById() {
    return firstValueFrom(this.userService.getUserById());
  }

  public getUsers() {
    return firstValueFrom(this.userService.listUsers());
  }

  public updateUser() {
    return firstValueFrom(this.userService.updateUser());
  }

  public logout(token: string, jti: string) {
    return firstValueFrom(this.userService.logout({ token, jti }));
  }

  public verifyEmail(dto: VerifyDto, sessionData: SessionDataDto) {
    return firstValueFrom(
      this.userService.verifyEmail({
        email: dto.email,
        confirmCode: dto.confirmCode,
        sessionData,
      }),
    );
  }
}
