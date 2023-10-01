import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
// import { OnEvent } from '@nestjs/event-emitter';
// import { User } from 'database/entities';
// import { Event } from 'src/common/enums';
// import { UserAuthEvent } from './events';
import { AppConfig } from 'src/config';
import { RoomService } from './room.service';

@Injectable()
export class RoomListener {
  constructor(
    private readonly roomService: RoomService,
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
  ) {}

  // @OnEvent(Event.USER_AUTH, { async: true })
  // async handleUserLoginEvent({ user, device }: UserAuthEvent): Promise<void> {}

  // @OnEvent(Event.USER_FIRST_LOGIN, { async: true })
  // async handleUserFirstLoginEvent({ user }: UserAuthEvent): Promise<void> {}

  // @OnEvent(Event.USER_LOGOUT, { async: true })
  // async handleUserLogoutEvent(user: User, platform?: Platform): Promise<void> {}
}
