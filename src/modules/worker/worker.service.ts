import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ResetType } from 'database/enums';
import { UserGameInfoService } from '../userGameInfo/userGameInfo.service';
import { RoomService } from '../room/room.service';

@Injectable()
export class WorkerService {
  constructor(private userGameInfoService: UserGameInfoService, private roomService: RoomService) {}

  @Cron('0 0 0 * * *')
  async dailyResetWorker(): Promise<void> {
    await this.userGameInfoService.resetRank(ResetType.DAY);
  }

  @Cron('0 0 0 * * 0')
  async weeklyResetWorker(): Promise<void> {
    await this.userGameInfoService.resetRank(ResetType.WEEK);
  }

  @Cron('0 0 0 1 * 0')
  async monthlyResetWorker(): Promise<void> {
    await this.userGameInfoService.resetRank(ResetType.MONTH);
  }

  @Cron('*/20 * * * * *')
  async botCheckInterval(): Promise<void> {
    // await this.roomService.workerCheckJoinRoom();
    // await this.botService.workerCheckJoinRoom();
  }
}
