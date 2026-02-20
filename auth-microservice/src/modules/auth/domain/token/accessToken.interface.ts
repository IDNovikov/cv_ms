export interface IAccessTokenPayload {
  sub: number;
  email: string;
  role: 'ADMIN' | 'USER';
  jti: string;
}
