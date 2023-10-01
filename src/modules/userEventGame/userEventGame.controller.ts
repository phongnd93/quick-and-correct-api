import { Get, Controller, HttpCode, HttpStatus, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindOneParams } from 'database/dtos';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { UserEventGameService } from './userEventGame.service';
import { UserEventGamePlayed } from './dtos/userEventGamelayed.dto';

@Controller('userGameInfos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('UserGameInfo')
export class UserEventGameController {
  constructor(private readonly userEventInfoService: UserEventGameService) {}

  @Get('userEvent/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: [UserEventGamePlayed] })
  async getQuestionById(@Param() { id }: FindOneParams): Promise<UserEventGamePlayed[]> {
    return this.userEventInfoService.getAllUserEvent(id);
  }
}
