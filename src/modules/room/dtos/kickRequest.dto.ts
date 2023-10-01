import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class KickRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  userId: string;
}
