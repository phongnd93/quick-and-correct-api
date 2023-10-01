import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyLoginDto {
  @IsString()
  @IsNotEmpty()
  session: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'foobar@codelight.co' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
