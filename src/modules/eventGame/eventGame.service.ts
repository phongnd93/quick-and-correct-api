import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { EventGame } from 'database/entities/eventGame.entity';
import { User } from 'database/entities';
import { D2MBadRequestException } from 'src/common/infra-exception';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { UserGameInfoService } from '../userGameInfo/userGameInfo.service';

@Injectable()
export class EventGameService extends BaseService<EventGame> {
  constructor(
    @InjectRepository(EventGame)
    private eventRepository: Repository<EventGame>,
    private userGameInfoService: UserGameInfoService,
  ) {
    super(eventRepository);
  }

  async findByIdOrFail(id: string): Promise<EventGame> {
    return this.eventRepository.findOneByOrFail({ id });
  }

  async createEvent(
    user: User,
    eventName: string,
    amountPlayer: number,
    password: string,
    startTime: number,
    endTime: number,
  ): Promise<UserGameInfo | null> {
    const userData = await this.userGameInfoService.findOne({ userId: user.id });

    if (userData) {
      if (
        userData.eventId &&
        userData.eventId.length > 0 &&
        userData.eventPlayTime > 0 &&
        userData.eventCreateTime > 0
      ) {
        throw new D2MBadRequestException('Bạn đang tham gia 1 sự kiện khác không thể tạo mới!');
      }
      const time = new Date(1970, 0, 1, 0, 0, 0, 0);
      const day = new Date(time.getTime() + startTime);
      const eventEndTime = new Date(time.getTime() + endTime);

      const newEvent = await this.create({
        eventName,
        nameCreateBy: userData.userName,
        startTime: day,
        currentUser: 1,
        createBy: userData.id,
        endTime: eventEndTime,
        amountPlayer,
        password,
      });
      const updateUser = await this.userGameInfoService.TakeInEvent(
        userData,
        eventEndTime,
        newEvent.id,
        userData.eventPlayTime,
        userData.eventCreateTime - 1,
        eventName,
      );

      return updateUser;
    }
    throw new D2MBadRequestException('Can not find user');
  }

  async TakeInEvent(user: User, eventId: string, password: string): Promise<UserGameInfo | null> {
    const userData = await this.userGameInfoService.findOne({ userId: user.id });
    const event = await this.eventRepository.findOneBy({ id: eventId });
    if (userData && userData.eventId && userData.eventId.length > 0) {
      if (userData.eventEndTime.getTime() < new Date(Date.now()).getTime()) {
        userData.eventId = '';
      }
    }
    if (
      event &&
      userData &&
      userData.eventPlayTime > 0 &&
      (!userData.eventId || userData.eventId.length === 0) &&
      (event.password.length === 0 || (event.password.length > 0 && password === event.password))
    ) {
      const updateUser = await this.userGameInfoService.TakeInEvent(
        userData,
        event.endTime,
        event.id,
        userData.eventPlayTime - 1,
        userData.eventCreateTime,
        event.eventName,
      );
      await this.eventRepository.update(event.id, {
        currentUser: event.currentUser + 1,
      });
      return updateUser;
    }
    throw new D2MBadRequestException('Cannot find user');
  }
}
