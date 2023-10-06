import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @MinLength(4, { message: 'Length of description is too short. Minimun length is 4' })
  @MaxLength(20, { message: 'Length of description is too long. Maximun length is 20' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  priority: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  numlimit: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}
