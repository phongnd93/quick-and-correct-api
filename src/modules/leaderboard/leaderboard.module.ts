import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leaderboard } from 'database/entities';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardListener } from './leaderboard.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Leaderboard])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardListener],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
