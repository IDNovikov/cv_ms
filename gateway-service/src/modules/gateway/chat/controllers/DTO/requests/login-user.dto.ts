import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '@/shared/validators';

export class LoginUserRequest {
  @IsString()
  @IsEmail()
  public email: string;

  @IsString()
  @IsStrongPassword()
  public password: string;

  @IsString()
  public token: string;
}
