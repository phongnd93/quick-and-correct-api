import { ApiResponseProperty } from '@nestjs/swagger';

export class RewardResponse {
  @ApiResponseProperty()
  ruby: number;

  @ApiResponseProperty()
  save: number;

  @ApiResponseProperty()
  help: number;
}
