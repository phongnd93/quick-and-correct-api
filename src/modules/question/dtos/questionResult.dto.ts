import { ApiProperty } from '@nestjs/swagger';
import { RoomProcessing } from 'src/modules/room/dtos/roomProcessing.dto';

export class QuestionResult {
  @ApiProperty()
  result: string | null;

  @ApiProperty()
  amountQuestion: number | null;

  @ApiProperty()
  users: RoomProcessing[];
}
