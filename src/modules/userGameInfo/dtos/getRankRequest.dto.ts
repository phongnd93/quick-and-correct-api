import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetRankRequest {
  @ApiProperty({ example: '123456' })
  @IsNumber()
  rankType: number;

  @ApiProperty({ example: '123456' })
  @IsNumber()
  rankTimeType: number;
}
