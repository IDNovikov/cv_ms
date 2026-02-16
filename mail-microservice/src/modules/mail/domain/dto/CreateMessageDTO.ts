import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMessageDTO {
  @IsOptional()
  @IsString()
  from?: string;

  @IsEmail()
  @IsString()
  toEmail: string;

  @IsString()
  subject: string;

  @Type(() => String)
  text: string;

  @IsOptional()
  @IsString()
  html?: string;
}
