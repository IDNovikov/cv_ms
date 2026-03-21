import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '@/shared/validators';

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsNotEmpty() @IsStrongPassword() password!: string;
}
