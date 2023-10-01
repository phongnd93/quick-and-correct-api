import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventGame } from 'database/entities/userEventGame.entity';
import { UserModule } from '../user/user.module';
import { UserEventGameController } from './userEventGame.controller';
import { UserEventGameService } from './userEventGame.service';
import { UserEventGameListener } from './userEventGame.listener';

@Module({
  imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([UserEventGame])],
  controllers: [UserEventGameController],
  providers: [UserEventGameService, UserEventGameListener],
  exports: [UserEventGameService],
})
export class UserEventGameModule {}
