import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from 'database/entities';
import { BotListener } from './bot.listener';
import { UserModule } from '../user/user.module';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { UserGameInfoModule } from '../userGameInfo/userGameInfo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bot]),
    forwardRef(() => UserModule),
    // forwardRef(() => RoomModule)
    forwardRef(() => UserGameInfoModule),
  ],
  controllers: [BotController],
  providers: [BotService, BotListener],
  exports: [BotService],
})
export class BotModule {}
