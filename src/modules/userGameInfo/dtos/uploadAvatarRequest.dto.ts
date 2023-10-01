import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadAvatarRequest {
  @ApiProperty({ example: '' })
  @IsString()
  base64Avatar: string;
}
