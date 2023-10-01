import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeNameRequest {
  @ApiProperty({ example: '' })
  @IsString()
  userName: string;
}
