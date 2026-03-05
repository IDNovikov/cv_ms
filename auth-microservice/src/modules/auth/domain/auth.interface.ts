export interface IAuth {
  id: string;
  userId: string;
  isEmailVerified: boolean;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BANNED' | 'DELETED';
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
