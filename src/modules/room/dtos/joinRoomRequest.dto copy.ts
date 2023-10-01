import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinRoomRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}
