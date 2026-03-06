export abstract class UserRpcPort {
  abstract getUserByName(userName: string): Promise<UserRPCData | null>;
  abstract getUserById(id: string): Promise<UserRPCData | null>;
  updateUser;
  abstract createUser({
    userName,
  }: {
    userName: string;
  }): Promise<UserRPCData | null>;
}
