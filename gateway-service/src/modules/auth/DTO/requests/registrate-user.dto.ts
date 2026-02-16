import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistrationUserDTO {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(5)
  userName: string;

  @IsString()
  @MinLength(5)
  password: string;
}
