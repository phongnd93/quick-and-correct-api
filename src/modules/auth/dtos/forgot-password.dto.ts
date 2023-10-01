import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'cheng.cit@gmail.com' })
  @IsEmail()
  email: string;
}
