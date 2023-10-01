import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AnswerRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  answer: string;
}
