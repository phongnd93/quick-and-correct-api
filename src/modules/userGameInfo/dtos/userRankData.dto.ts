import { ApiResponseProperty } from '@nestjs/swagger';

export class UserRankData {
  @ApiResponseProperty()
  userId: string;

  @ApiResponseProperty()
  userName: string;

  @ApiResponseProperty()
  score: number | 0;

  @ApiResponseProperty()
  timeAnswer: number | 0;

  @ApiResponseProperty()
  ambassadorLevel: number | 0;

  @ApiResponseProperty()
  avatar: string | null;
}
