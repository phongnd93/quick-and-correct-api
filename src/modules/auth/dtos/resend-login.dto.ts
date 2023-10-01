import { IsNotEmpty, IsString } from 'class-validator';

export class ResendLoginDto {
  @IsString()
  @IsNotEmpty()
  session: string;
}
