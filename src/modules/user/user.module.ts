import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from 'database/entities';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserListener } from './user.listener';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    PassportModule,
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserListener],
  exports: [UserService],
})
export class UserModule {}
