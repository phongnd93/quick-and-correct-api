import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ uniqueItems: true, required: true, example: 'abc@xyz.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8, { message: 'Length of password is too short. Minimum length is 8' })
  @MaxLength(32, { message: 'Length of password is too long. Maximum length is 32' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,32}$/, {
    message: 'Password too weak',
  })
  password: string;

  @ApiProperty({ required: true, minLength: 8, maxLength: 128, example: 'John Doe' })
  @IsString()
  @MinLength(8, { message: 'Name is too short. Minimum length is 8' })
  @MaxLength(128, { message: 'Name is too long. Maximum length is 128' })
  name: string;
}

export class RegisterNonVerifyDto {
  @ApiProperty({ uniqueItems: true, required: false, example: 'abc@xyz.com' })
  @IsString()
  email: string;

  @ApiProperty({ uniqueItems: true, required: true, example: 'vietnguyen2290' })
  @IsString()
  userNameLogin: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8, maxLength: 32 })
  @IsString()
  password: string;

  @ApiProperty({ required: true, minLength: 8, maxLength: 128, example: 'John Doe' })
  @IsString()
  name: string;
}

export class VerifyRegisterDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ uniqueItems: true, required: true, example: 'abc@xyz.com' })
  @IsEmail()
  email: string;
}
