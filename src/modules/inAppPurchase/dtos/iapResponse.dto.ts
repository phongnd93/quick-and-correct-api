import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class IAPResponse {
  @ApiResponseProperty()
  @IsString()
  message: string;

  @ApiResponseProperty()
  @IsNumber()
  ruby: number;

  @ApiResponseProperty()
  @IsNumber()
  save: number;

  @ApiResponseProperty()
  @IsNumber()
  help: number;
}
