import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  isComplete: boolean;
}
