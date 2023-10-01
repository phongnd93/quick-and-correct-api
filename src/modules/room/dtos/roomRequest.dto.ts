import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RoomRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  roomId: string;
}
