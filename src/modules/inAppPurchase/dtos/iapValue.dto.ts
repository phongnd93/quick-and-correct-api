import { ApiResponseProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class IAPValue {
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
