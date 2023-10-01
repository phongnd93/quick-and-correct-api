import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { RoomType } from 'database/enums';

export class RoomCreateRequest {
  @ApiProperty({ example: '123456' })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty({ example: '123456' })
  @IsNumber()
  maxPlayer: number;

  @ApiProperty({ example: '123456' })
  @IsNumber()
  amountQuestion: number;

  @ApiProperty({ example: '123456' })
  @IsNumber()
  rubyBet: number;

  @ApiProperty({ example: '123456' })
  @IsString()
  roomName: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}
