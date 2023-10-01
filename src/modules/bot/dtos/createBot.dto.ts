import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBotRequest {
  @ApiProperty({ example: '123456' })
  @IsNumber()
  star: number;

  @ApiProperty({ example: '123456' })
  @IsString()
  categoryId: string;
}
