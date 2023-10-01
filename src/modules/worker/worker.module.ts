import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WorkerService } from './worker.service';
import { UserGameInfoModule } from '../userGameInfo/userGameInfo.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => UserGameInfoModule),
    forwardRef(() => RoomModule),
  ],
  controllers: [],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
