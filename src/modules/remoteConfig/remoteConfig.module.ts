import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteConfig } from 'database/entities/remoteConfig.entity';
import { UserModule } from '../user/user.module';
import { RemoteConfigController } from './remoteConfig.controller';
import { RemoteConfigService } from './remoteConfig.service';
import { RemoteConfigListener } from './remoteConfig.listener';

@Module({
  imports: [TypeOrmModule.forFeature([RemoteConfig]), forwardRef(() => UserModule)],
  controllers: [RemoteConfigController],
  providers: [RemoteConfigService, RemoteConfigListener],
  exports: [RemoteConfigService],
})
export class RemoteConfigModule {}
