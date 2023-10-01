import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { UserGameInfoController } from './userGameInfo.controller';
import { UserGameInfoService } from './userGameInfo.service';
import { UserGameInfoListener } from './userGameInfo.listener';
import { UserModule } from '../user/user.module';
import { BotModule } from '../bot/bot.module';
import { ConfigGameModule } from '../config/configGame.module';
import { UserEventGameModule } from '../userEventGame/userEventGame.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => BotModule),
    forwardRef(() => ConfigGameModule),
    UserEventGameModule,
    TypeOrmModule.forFeature([UserGameInfo]),
  ],
  controllers: [UserGameInfoController],
  providers: [UserGameInfoService, UserGameInfoListener],
  exports: [UserGameInfoService],
})
export class UserGameInfoModule {}
