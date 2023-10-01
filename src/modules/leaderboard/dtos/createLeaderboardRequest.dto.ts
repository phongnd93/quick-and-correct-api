import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateLeaderboardRequest {
  @ApiProperty({ example: 'John' })
  @IsString()
  playerName: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country: string;
}
