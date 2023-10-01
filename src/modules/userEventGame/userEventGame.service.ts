import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { UserEventGame } from 'database/entities/userEventGame.entity';
import { UserEventGamePlayed } from './dtos/userEventGamelayed.dto';

@Injectable()
export class UserEventGameService extends BaseService<UserEventGame> {
  constructor(
    @InjectRepository(UserEventGame)
    private userEventGameRepository: Repository<UserEventGame>,
  ) {
    super(userEventGameRepository);
  }

  async findByEventId(eventId: string): Promise<UserEventGame[]> {
    return this.userEventGameRepository.findBy({ eventId });
  }

  async findByIdOrFail(id: string): Promise<UserEventGame> {
    return this.userEventGameRepository.findOneByOrFail({ id });
  }

  async sortLeaderboard(eventId: string): Promise<void> {
    const data = await this.userEventGameRepository.findBy({ eventId });
    data.sort((x, y) => {
      return x.score - y.score && y.timeAnswer - x.timeAnswer;
    });
    data.map((x) => {
      const index = data.indexOf(x);
      data[index].rank = index;
      return x;
    });
    await this.userEventGameRepository.save(data);
  }

  async addScore(
    ruby: number,
    userGameId: string,
    eventId: string,
    timeAnswer: number,
    isUpdateLeaderBoard: boolean,
  ): Promise<void> {
    if (eventId == null) return;
    const userGameInfo = await this.findOneOrFail({ userGameId, eventId });

    if (userGameInfo) {
      const isVisibleEvent = userGameInfo.endTime && new Date(Date.now()) < userGameInfo.endTime;
      const newScore = isUpdateLeaderBoard ? ruby : 0;
      const addTimeAnswer = isUpdateLeaderBoard ? timeAnswer : 0;
      await this.update(userGameInfo.id, {
        score: isVisibleEvent ? userGameInfo.score + newScore : userGameInfo.score,
        timeAnswer: isVisibleEvent
          ? userGameInfo.timeAnswer + addTimeAnswer
          : userGameInfo.timeAnswer,
      });

      await this.sortLeaderboard(eventId);
    }
  }

  async countAmountGotTop3(userGameId: string): Promise<number> {
    const listEvent = await this.userEventGameRepository.findBy({ userGameId });
    return listEvent.filter((x) => {
      return x.rank && x.rank < 3;
    }).length;
  }

  async getAllUserEvent(userGameId: string): Promise<UserEventGamePlayed[]> {
    const abs: any[] = await this.userEventGameRepository.query(
      `select * from public.user_event_games  INNER JOIN public.event_games ON cast(public.user_event_games.event_id as uuid) = public.event_games.id  where public.user_event_games.user_game_id =  '${userGameId}'`,
    );
    const result: UserEventGamePlayed[] = [];
    abs.map((x) => {
      result.push({
        eventName: x.event_name,
        rank: x.rank,
        startTime: x.start_time,
        endTime: x.end_time,
        createName: x.name_create_by,
      });

      return x;
    });
    return result;
  }
}
