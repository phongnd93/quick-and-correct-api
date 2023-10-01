import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ApproveQuestionDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}
