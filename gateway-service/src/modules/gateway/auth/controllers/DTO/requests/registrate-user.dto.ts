import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '@/shared/validators';

export class RegistrationUserDTO {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(5)
  userName: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
