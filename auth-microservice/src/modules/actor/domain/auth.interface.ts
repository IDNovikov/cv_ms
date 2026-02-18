export interface IAuth {
  id: string;
  userId: string | null;
  isEmailVerified: boolean;
  role: userRoles;
  status: userStatus;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

type userRoles = 'ADMIN' | 'USER';

type userStatus = 'ACTIVE' | 'BANNED' | 'DELETED';
