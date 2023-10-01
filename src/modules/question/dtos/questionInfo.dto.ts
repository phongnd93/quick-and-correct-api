import { ApiResponseProperty } from '@nestjs/swagger';
import { QuestionType } from 'database/enums/question-type';
import { RoomProcessing } from 'src/modules/room/dtos/roomProcessing.dto';

export class QuestionInfoDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  content: string;

  @ApiResponseProperty()
  categoryId: string;

  @ApiResponseProperty()
  questionType: QuestionType;

  @ApiResponseProperty()
  answerA: string;

  @ApiResponseProperty()
  answerB: string;

  @ApiResponseProperty()
  answerC: string | null;

  @ApiResponseProperty()
  answerD: string | null;

  @ApiResponseProperty()
  star: number;

  @ApiResponseProperty()
  imageUrl: string | null;

  @ApiResponseProperty()
  createdBy: string | null;

  @ApiResponseProperty()
  approved: boolean | null;

  @ApiResponseProperty()
  approvedBy: string | null;

  @ApiResponseProperty()
  approveDate: Date | null;

  @ApiResponseProperty()
  active: boolean;

  @ApiResponseProperty()
  users: RoomProcessing[] | null;

  @ApiResponseProperty()
  nextQuestion: string | null;
}
