import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from 'database/entities';
import { RewardController } from './reward.controller';
import { RewardListener } from './reward.listener';
import { UserGameInfoModule } from '../userGameInfo/userGameInfo.module';
import { RewardService } from './reward.service';
import { InAppPurchaseModule } from '../inAppPurchase/inAppPurchase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), UserGameInfoModule, InAppPurchaseModule],
  controllers: [RewardController],
  providers: [RewardListener, RewardService],
  exports: [RewardService],
})
export class RewardModule {}
