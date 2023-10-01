import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventGame } from 'database/entities/eventGame.entity';
import { UserModule } from '../user/user.module';
import { EventGameController } from './eventGame.controller';
import { EventGameService } from './eventGame.service';
import { EventGameListener } from './eventGame.listener';
import { UserGameInfoModule } from '../userGameInfo/userGameInfo.module';
import { UserEventGameModule } from '../userEventGame/userEventGame.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventGame]),
    forwardRef(() => UserModule),
    UserGameInfoModule,
    UserEventGameModule,
  ],
  controllers: [EventGameController],
  providers: [EventGameService, EventGameListener],
  exports: [EventGameService],
})
export class EventGameModule {}
