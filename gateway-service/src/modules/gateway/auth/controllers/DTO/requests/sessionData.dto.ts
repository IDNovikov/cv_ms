import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

export class SessionLocationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ip: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class SessionDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userAgent: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  device: string;

  @ApiProperty({ type: SessionLocationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SessionLocationDto)
  location: SessionLocationDto;
}
