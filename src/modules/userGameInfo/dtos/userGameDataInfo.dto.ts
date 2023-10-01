import { ApiResponseProperty } from '@nestjs/swagger';

export class UserGameDataInfo {
  @ApiResponseProperty()
  userName: string;

  @ApiResponseProperty()
  rankDay: number;

  @ApiResponseProperty()
  rankWeek: number;

  @ApiResponseProperty()
  rankMonth: number;

  @ApiResponseProperty()
  ambassadorLevel: number;

  @ApiResponseProperty()
  correctAnswer: number;

  @ApiResponseProperty()
  errorAnswer: number;

  @ApiResponseProperty()
  ruby: number;

  @ApiResponseProperty()
  avatar: string | null;
}
