import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserNameDTO {
  @ApiProperty({ default: 'vietnguyen0907' })
  @IsString()
  userNameLogin: string;

  @ApiProperty({ default: 'Password12' })
  @IsString()
  password: string;
}
