import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GenerateTwoFactorResponseDto {
  secret?: string;

  otpAuthUrl?: string;
}

export class ActivateTwoFactorDto {
  @ApiProperty({ example: '123456', type: String, minLength: 6, maxLength: 6, required: true })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  twoFactorCode: string;

  @ApiProperty({ example: 'password', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  password: string;
}
