import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
