import {
  AuthDataResponse,
  GetAuthDataByUserIdRequest,
} from '@noildm/contracts/dist/gen/auth';

export abstract class AuthGrpcPort {
  abstract getAuthById(
    request: GetAuthDataByUserIdRequest,
  ): Promise<AuthDataResponse>;
}
