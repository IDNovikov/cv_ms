export interface IAuth {
  id: string;
  userId: string | null;
  isEmailVerified: boolean;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'BANNED' | 'DELETED';
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}
