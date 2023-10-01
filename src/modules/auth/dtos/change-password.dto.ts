import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class VerifyChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8, { message: 'Length of password is too short. Minimum length is 8' })
  @MaxLength(32, { message: 'Length of password is too long. Maximum length is 32' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,32}$/, {
    message: 'Password too weak',
  })
  newPassword: string;
}
