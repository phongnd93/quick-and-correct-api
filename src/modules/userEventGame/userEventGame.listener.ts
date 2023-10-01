import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppConfig } from 'src/config';
import { UserEventGameService } from './userEventGame.service';

@Injectable()
export class UserEventGameListener {
  constructor(
    private readonly userGameEventService: UserEventGameService,
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
  ) {}
}
