import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QuestionResultRequest {
  @ApiProperty({ example: '123456' })
  @IsString()
  questionId: string;
}
