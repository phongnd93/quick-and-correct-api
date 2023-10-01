import { ApiResponseProperty } from '@nestjs/swagger';
import { UserRankData } from './userRankData.dto';

export class UserRankDataResponse {
  @ApiResponseProperty()
  leaderBoard: UserRankData[];

  @ApiResponseProperty()
  rank: number | 0;

  @ApiResponseProperty()
  totalPlayer: number | 0;
}
