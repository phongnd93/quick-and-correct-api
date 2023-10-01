import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
