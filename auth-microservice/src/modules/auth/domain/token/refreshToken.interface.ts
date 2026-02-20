export interface IRefreshTokenPayload {
  sub: number;
  email: string;
  role: 'ADMIN' | 'USER';
  deviceId: string;
}
