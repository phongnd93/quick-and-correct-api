import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { QuestionType } from 'database/enums/question-type';

export class CreateQuestionDto {
  @ApiProperty()
  @MinLength(5, { message: 'Length of description is too short. Minimun length is 5' })
  @MaxLength(400, { message: 'Length of description is too long. Maximun length is 400' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ default: '0' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ default: QuestionType.TEXT })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  questionType: QuestionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answerA: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  answerB: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  answerC: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  answerD: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsNotEmpty()
  star: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  result: string;

  @ApiProperty({ default: '' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}
