export interface IUser {
  id: string;
  email: string;
  userName: string;
  telegramId: string | null;
  userImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
