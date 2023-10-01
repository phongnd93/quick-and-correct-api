import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  password: string;
}
