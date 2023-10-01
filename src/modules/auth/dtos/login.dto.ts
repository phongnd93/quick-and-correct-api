import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ProfileResponseDto } from 'src/modules/user/dtos';

export class LoginDto {
  @ApiProperty({ default: 'im.vinhle@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class LoginResponseDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty({ type: ProfileResponseDto })
  user: ProfileResponseDto;
}
