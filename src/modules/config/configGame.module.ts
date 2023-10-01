import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigGame } from 'database/entities/configGame.entity';
import { UserModule } from '../user/user.module';
import { ConfigGameController } from './configGame.controller';
import { ConfigGameService } from './configGame.service';
import { ConfigGameListener } from './configGame.listener';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigGame]), forwardRef(() => UserModule)],
  controllers: [ConfigGameController],
  providers: [ConfigGameService, ConfigGameListener],
  exports: [ConfigGameService],
})
export class ConfigGameModule {}
