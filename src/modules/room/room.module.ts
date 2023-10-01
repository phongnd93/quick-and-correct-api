import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from 'database/entities/room.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomListener } from './room.listener';
import { QuestionModule } from '../question/question.module';
import { UserGameInfoModule } from '../userGameInfo/userGameInfo.module';
import { BotModule } from '../bot/bot.module';
import { ConfigGameModule } from '../config/configGame.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    QuestionModule,
    forwardRef(() => UserGameInfoModule),
    forwardRef(() => BotModule),
    forwardRef(() => ConfigGameModule),
    CategoryModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomListener],
  exports: [RoomService],
})
export class RoomModule {}
