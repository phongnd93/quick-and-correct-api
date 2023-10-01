import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateEventRequest {
  @ApiProperty({ example: 'Nhanh Và Đúng' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  amountPlayer: number;

  @ApiProperty({ example: '' })
  @IsString()
  password: string;

  @ApiProperty({ example: '' })
  @IsNumber()
  startTime: number;

  @ApiProperty({ example: '' })
  @IsNumber()
  endTime: number;
}
