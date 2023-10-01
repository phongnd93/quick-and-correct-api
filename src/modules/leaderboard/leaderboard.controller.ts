import { Body, Get, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Leaderboard } from 'database/entities';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardRequest } from './dtos/createLeaderboardRequest.dto';
import { UpdateLeaderboard } from './dtos/updateLeaderboard.dto';

@Controller('Leaderboard')
@ApiTags('Leaderboard')
export class LeaderboardController {
  constructor(private readonly leadeboardService: LeaderboardService) {}

  @Post('/update-leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update leaderboard' })
  @ApiOkResponse({ type: Leaderboard })
  @ApiBody({ type: UpdateLeaderboard })
  async update(@Body() updateLeaderboard: UpdateLeaderboard): Promise<Leaderboard[]> {
    return this.leadeboardService.updateLeaderboard(updateLeaderboard);
  }

  @Get('/top-ten')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Leaderboard })
  async GetTopTen(): Promise<Leaderboard[]> {
    return this.leadeboardService.getTopTen();
  }

  @Post('/get-my-rank')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateLeaderboard })
  @ApiOkResponse({ type: Leaderboard })
  async GetPlayerLeaderboard(@Body() updateLeaderboard: UpdateLeaderboard): Promise<Leaderboard[]> {
    return this.leadeboardService.getPlayerLeaderboard(updateLeaderboard);
  }

  @Post('create-leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateLeaderboardRequest })
  @ApiOkResponse({ type: 'string' })
  async createLeaderboard(@Body() body: CreateLeaderboardRequest): Promise<string> {
    return (await this.leadeboardService.create(body)).id;
  }

  @Post('/update-name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UpdateLeaderboard })
  async updateName(@Body() updateLeaderboard: UpdateLeaderboard): Promise<void> {
    await this.leadeboardService.updateName(updateLeaderboard);
  }
}
