import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateLeaderboard {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
