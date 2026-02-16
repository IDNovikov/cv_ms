import { IsEnum, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { IdentifierValidator } from 'src/shared/validators';

export class LoginUserRequest {
  @IsEnum(['email', 'userName'])
  public type: 'email' | 'userName';

  @Validate(IdentifierValidator)
  public identifier: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  public password: string;
}
