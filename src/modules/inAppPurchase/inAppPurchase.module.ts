import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InAppPurchase } from 'database/entities/inAppPurchase.entity';
import { UserModule } from '../user/user.module';
import { InAppPurchaseController } from './inAppPurchase.controller';
import { InAppPurchaseService } from './inAppPurchase.service';
import { InAppPurchaseListener } from './inAppPurchase.listener';

@Module({
  imports: [TypeOrmModule.forFeature([InAppPurchase]), forwardRef(() => UserModule)],
  controllers: [InAppPurchaseController],
  providers: [InAppPurchaseService, InAppPurchaseListener],
  exports: [InAppPurchaseService],
})
export class InAppPurchaseModule {}
