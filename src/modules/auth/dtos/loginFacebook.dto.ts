import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginFacebookDto {
  @ApiProperty({ default: 'im.vinhle@gmail.com' })
  @IsString()
  facebookId: string;

  @ApiProperty({ default: 'vinhle' })
  @IsString()
  userName: string;
}
