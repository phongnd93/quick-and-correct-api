import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class TakeInEventRequest {
  @ApiProperty({ example: '' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: '' })
  @IsString()
  password: string;
}
