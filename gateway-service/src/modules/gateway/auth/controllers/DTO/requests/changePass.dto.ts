import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '@/shared/validators';

export class ChangePassDto {
  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @IsStrongPassword()
  oldPassword!: string;
  @ApiProperty({ minLength: 8 })
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword!: string;
}
