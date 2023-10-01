import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IAPRequest {
  @ApiProperty({ example: '12345' })
  @IsString()
  apiPackage: string;
}
