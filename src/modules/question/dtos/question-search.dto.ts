import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos';

export class QuestionSearchDto extends PageOptionsDto {
  @ApiProperty({ default: 'all' })
  @IsString()
  createdBy: string;

  @ApiProperty({ default: 'all' })
  @IsString()
  category: string;

  @ApiProperty({ default: 'all' })
  @IsString()
  questionType: string;
}
