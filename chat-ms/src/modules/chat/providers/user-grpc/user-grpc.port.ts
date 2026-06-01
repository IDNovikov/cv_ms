import {
  GetUserByIdRequest,
  UserResponse,
} from '@noildm/contracts/dist/gen/user';

export abstract class UserGrpcPort {
  abstract getUserById(request: GetUserByIdRequest): Promise<UserResponse>;
}
