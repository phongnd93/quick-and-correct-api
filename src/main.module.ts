import { Module, OnModuleDestroy, Inject, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfig, configurations, DatabaseConfig, LogConfig } from './config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalHandleExceptionFilter } from './common/infra-exception';
import { LoggerMiddleware } from './common/middlewares';
import { QuestionModule } from './modules/question/question.module';
import { RoomModule } from './modules/room/room.module';
import { UserGameInfoModule } from './modules/userGameInfo/userGameInfo.module';
import { CategoryModule } from './modules/category/category.module';
import { WorkerModule } from './modules/worker/worker.module';
import { BotModule } from './modules/bot/bot.module';
import { RewardModule } from './modules/reward/reward.module';
import { ConfigGameModule } from './modules/config/configGame.module';
import { EventGameModule } from './modules/eventGame/eventGame.module';
import { RemoteConfigModule } from './modules/remoteConfig/remoteConfig.module';
import { InAppPurchaseModule } from './modules/inAppPurchase/inAppPurchase.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { UserEventGameModule } from './modules/userEventGame/userEventGame.module';

const modules = [
  UserModule,
  AuthModule,
  CategoryModule,
  QuestionModule,
  RoomModule,
  UserGameInfoModule,
  WorkerModule,
  BotModule,
  RewardModule,
  ConfigGameModule,
  EventGameModule,
  RemoteConfigModule,
  InAppPurchaseModule,
  LeaderboardModule,
  UserEventGameModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configurations,
      isGlobal: true,
      envFilePath: [`.env`],
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRootAsync({
      inject: [LogConfig.KEY],
      useFactory: (config: ConfigType<typeof LogConfig>) => {
        if (!config) {
          throw new Error('Cannot start app without winston config');
        }
        return config as WinstonModuleOptions;
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [DatabaseConfig.KEY],
      useFactory: (config: ConfigType<typeof DatabaseConfig>) => {
        if (!config) {
          throw new Error('Cannot start app without ORM config');
        }
        return config as TypeOrmModuleOptions;
      },
    }),
    EventEmitterModule.forRoot(),
    ...modules,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHandleExceptionFilter,
    },
  ],
})
export class MainModule implements OnModuleDestroy, NestModule {
  static apiPrefix: string;

  static corsOrigins: string[];

  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
  ) {
    MainModule.apiPrefix = 'v1';
    MainModule.corsOrigins = this.appConfig.corsOrigins.split('|') || 'http://localhost:3000';
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).exclude('(.*healthz.*)', '(.*auth.*)').forRoutes('*');
  }

  onModuleDestroy(): void {
    // TODO: Disconnect from database
  }
}
