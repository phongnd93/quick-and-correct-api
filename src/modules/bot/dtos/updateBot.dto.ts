import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBotDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  avatar: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
