import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { Bot, User } from 'database/entities';
import { randomInt } from 'crypto';
import { ResetType, SortDirection } from 'database/enums';
import { EventType } from 'database/enums/event-type';
import { AMBASSADOR_CONFIG_TAG } from 'src/common/constanst/gameConstant';
import { D2MBadRequestException } from 'src/common/infra-exception';
import { UserRankDataResponse } from './dtos/userRankDataResponse.dto';
import { RewardResponse } from '../reward/dtos/rewardResponse.dto';
import { ConfigGameService } from '../config/configGame.service';
import { UpgradeAmbassadorConfig } from '../config/dtos/upgradeAmbassadorConfig.dto';
import { UserGameDataInfo } from './dtos/userGameDataInfo.dto';
import { IAPResponse } from '../inAppPurchase/dtos/iapResponse.dto';
import { UserEventGameService } from '../userEventGame/userEventGame.service';

@Injectable()
export class UserGameInfoService extends BaseService<UserGameInfo> {
  constructor(
    @InjectRepository(UserGameInfo)
    private userGameInfoRepository: Repository<UserGameInfo>,
    private configService: ConfigGameService,
    private userEventGameService: UserEventGameService,
  ) {
    super(userGameInfoRepository);
  }

  async findByIdOrFail(id: string): Promise<UserGameInfo> {
    return this.userGameInfoRepository.findOneByOrFail({ id });
  }

  async addScore(
    ruby: number,
    streak: number,
    userId: string,
    timeAnswer: number,
    isUpdateLeaderBoard: boolean,
  ): Promise<UserGameInfo> {
    const userGameInfo = await this.findOneOrFail({ userId });

    const newScore = isUpdateLeaderBoard ? ruby : 0;
    const addTimeAnswer = isUpdateLeaderBoard ? timeAnswer : 0;
    const result = await this.update(userGameInfo.id, {
      scoreDay: userGameInfo.scoreDay + newScore,
      scoreMonth: userGameInfo.scoreMonth + newScore,
      scoreWeek: userGameInfo.scoreWeek + newScore,
      scoreComboStreakDay:
        streak > userGameInfo.scoreComboStreakDay && isUpdateLeaderBoard
          ? streak
          : userGameInfo.scoreComboStreakDay,
      scoreComboStreakWeek:
        streak > userGameInfo.scoreComboStreakWeek && isUpdateLeaderBoard
          ? streak
          : userGameInfo.scoreComboStreakWeek,
      scoreComboStreakMonth:
        streak > userGameInfo.scoreComboStreakMonth && isUpdateLeaderBoard
          ? streak
          : userGameInfo.scoreComboStreakMonth,
      timeAnswerStreakDay:
        streak > userGameInfo.scoreComboStreakDay && isUpdateLeaderBoard
          ? userGameInfo.currentTimeStreak + addTimeAnswer
          : userGameInfo.timeAnswerStreakDay,
      timeAnswerStreakWeek:
        streak > userGameInfo.scoreComboStreakWeek && isUpdateLeaderBoard
          ? userGameInfo.currentTimeStreak + addTimeAnswer
          : userGameInfo.timeAnswerStreakWeek,
      timeAnswerStreakMonth:
        streak > userGameInfo.scoreComboStreakMonth && isUpdateLeaderBoard
          ? userGameInfo.currentTimeStreak + addTimeAnswer
          : userGameInfo.timeAnswerStreakMonth,

      ruby: userGameInfo.ruby + ruby,
      currentTimeStreak:
        streak <= 1 ? addTimeAnswer : userGameInfo.currentTimeStreak + addTimeAnswer,
      timeAnswerDay: userGameInfo.timeAnswerDay + addTimeAnswer,
      timeAnswerMonth: userGameInfo.timeAnswerMonth + addTimeAnswer,
      timeAnswerWeek: userGameInfo.timeAnswerWeek + addTimeAnswer,
      correctAnswer: userGameInfo.correctAnswer + 1,
    });
    await this.userEventGameService.addScore(
      ruby,
      userGameInfo.id,
      userGameInfo.eventId,
      timeAnswer,
      isUpdateLeaderBoard,
    );
    if (result) {
      return result;
    }

    throw new Error('cannot find user');
  }

  async errorAnswer(userId: string): Promise<UserGameInfo> {
    const userGameInfo = await this.findOneOrFail({ userId });
    const result = await this.update(userGameInfo.id, {
      errorAnswer: userGameInfo.errorAnswer + 1,
    });
    if (result) {
      return result;
    }

    throw new Error('cannot find user');
  }

  async getUserByUserId(userId: string): Promise<UserGameInfo | null> {
    const result = await this.userGameInfoRepository.findOneBy({ userId });
    return result;
  }

  async createBotGameInfo(bot: Bot): Promise<string> {
    const result = await this.create({
      userId: bot.id,
      scoreDay: 0,
      scoreWeek: 0,
      scoreMonth: 0,
      userName: `Player${randomInt(0, 9).toString()}${randomInt(0, 9).toString()}${randomInt(
        0,
        9,
      ).toString()}${randomInt(0, 9).toString()}${randomInt(0, 9).toString()}`,
      scoreComboStreakDay: 0,
      scoreComboStreakMonth: 0,
      scoreComboStreakWeek: 0,
      ruby: 0,
      timeAnswerDay: 0,
      timeAnswerWeek: 0,
      timeAnswerMonth: 0,
      amountHelp50: 0,
      amountSaveLife: 0,
    });
    return result.id;
  }

  async GetUserGameInfo(user: User): Promise<UserGameInfo> {
    let result = await this.userGameInfoRepository.findOneBy({ userId: user.id });
    if (!result) {
      result = await this.create({
        userId: user.id,
        scoreDay: 0,
        scoreWeek: 0,
        scoreMonth: 0,

        userName: user.name,
        scoreComboStreakDay: 0,
        scoreComboStreakMonth: 0,
        scoreComboStreakWeek: 0,
        ruby: 0,
        timeAnswerDay: 0,
        timeAnswerWeek: 0,
        timeAnswerMonth: 0,
        amountHelp50: 0,
        amountSaveLife: 0,
        isDailyReward: true,
        ambassadorLevel: 0,
        eventPlayTime: 0,
      });
    }
    return result;
  }

  async GetUserRankStreak(user: User, type: number): Promise<UserRankDataResponse> {
    let data;
    const result = new UserRankDataResponse();
    switch (type) {
      case 0:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreComboStreakDay', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerStreakDay', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreComboStreakDay,
            userId: x.userId,
            timeAnswer: x.timeAnswerStreakDay,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      case 1:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreComboStreakWeek', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerStreakWeek', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreComboStreakWeek,
            userId: x.userId,
            timeAnswer: x.timeAnswerStreakWeek,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      case 2:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreComboStreakMonth', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerStreakMonth', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreComboStreakMonth,
            userId: x.userId,
            timeAnswer: x.timeAnswerStreakMonth,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      default:
        break;
    }
    result.totalPlayer = result.leaderBoard.length;
    result.leaderBoard = result.leaderBoard.slice(0, 50);
    return result;
  }

  async updateDailyreward(user: User, dailyPackage: string | null): Promise<UserGameInfo | null> {
    const userInfo = await this.findOne({ userId: user.id });
    if (userInfo) {
      return this.update(userInfo.id, { packageDaily: dailyPackage });
    }
    throw new Error('User not exists');
  }

  async getReward(userId: string, reward: RewardResponse, type: EventType): Promise<IAPResponse> {
    const userInfo = await this.findOne({ userId });

    if (userInfo) {
      if (type === EventType.DAILY) {
        if (userInfo.packageDaily) {
          const rewardDaily = JSON.parse(userInfo.packageDaily);
          if (rewardDaily) {
            await this.update(userInfo.id, {
              ruby: userInfo.ruby + rewardDaily.ruby,
              amountSaveLife: userInfo.amountSaveLife + rewardDaily.save,
              amountHelp50: userInfo.amountHelp50 + rewardDaily.help,
              isDailyReward: false,
            });

            return {
              message: '',
              ruby: rewardDaily.ruby,
              save: rewardDaily.save,
              help: rewardDaily.help,
            };
          }
        } else {
          await this.update(userInfo.id, {
            ruby: userInfo.ruby + reward.ruby,
            amountSaveLife: userInfo.amountSaveLife + reward.save,
            amountHelp50: userInfo.amountHelp50 + reward.help,
            isDailyReward: false,
          });
          return {
            message: '',
            ruby: reward.ruby,
            save: reward.save,
            help: reward.help,
          };
        }
      } else {
        await this.update(userInfo.id, {
          ruby: userInfo.ruby + reward.ruby,
          amountSaveLife: userInfo.amountSaveLife + reward.save,
          amountHelp50: userInfo.amountHelp50 + reward.help,
        });
        return {
          message: '',
          ruby: reward.ruby,
          save: reward.save,
          help: reward.help,
        };
      }
    }
    throw new Error('User not exists');
  }

  async getAmountTop3Event(user: User): Promise<number> {
    const userData = await this.userGameInfoRepository.findOneBy({ userId: user.id });
    if (userData) {
      return this.userEventGameService.countAmountGotTop3(userData.id);
    }
    throw new D2MBadRequestException('Lỗi thể lấy số lần đạt top');
  }

  async GetUserRank(user: User, type: number): Promise<UserRankDataResponse> {
    // const data = await this.findAll();
    let data;
    const result = new UserRankDataResponse();
    switch (type) {
      case 0:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreDay', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerDay', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreDay,
            userId: x.userId,
            timeAnswer: x.timeAnswerDay,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      case 1:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreWeek', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerWeek', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreWeek,
            userId: x.userId,
            timeAnswer: x.timeAnswerWeek,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      case 2:
        data = await this.userGameInfoRepository
          .createQueryBuilder('UserGameInfo')
          .select()
          .orderBy('UserGameInfo.scoreMonth', SortDirection.DESC)
          .addOrderBy('UserGameInfo.timeAnswerMonth', SortDirection.ASC)
          .getMany();
        result.leaderBoard = data.map((x) => {
          return {
            userName: x.userName,
            score: x.scoreMonth,
            userId: x.userId,
            timeAnswer: x.timeAnswerMonth,
            avatar: x.avatar,
            ambassadorLevel: x.ambassadorLevel,
          };
        });
        result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
        break;
      default:
        break;
    }
    result.totalPlayer = result.leaderBoard.length;
    result.leaderBoard = result.leaderBoard.slice(0, 50);
    return result;
  }

  async TakeInEvent(
    userData: UserGameInfo,
    eventEndTime: Date,
    eventId: string,
    eventPlayTime: number,
    eventCreateTime: number,
    eventName: string,
  ): Promise<UserGameInfo | null> {
    const dataEvent = {
      userGameId: userData.id,
      userGameName: userData.userName,
      score: 0,
      timeAnswer: 0,
      avatar: userData.avatar,
      ambassadorLevel: userData.ambassadorLevel,
      eventId,
      endTime: eventEndTime,
    };
    await this.userEventGameService.create(dataEvent);
    return this.update(userData.id, {
      eventPlayTime,
      eventEndTime,
      eventId,
      eventName,
      eventCreateTime,
    });
  }

  async GetUserRankEvent(user: User): Promise<UserRankDataResponse> {
    const userData = await this.userGameInfoRepository.findOneBy({ userId: user.id });
    if (userData && userData.eventId) {
      const data = await this.userEventGameService.findByEventId(userData.eventId);
      const result = new UserRankDataResponse();
      result.leaderBoard = data.map((x) => {
        return {
          userName: x.userGameName,
          score: x.score,
          userId: x.userGameId,
          timeAnswer: x.timeAnswer,
          avatar: x.avatar,
          ambassadorLevel: x.ambassadorLevel,
        };
      });
      result.rank = result.leaderBoard.findIndex((x) => x.userId === user.id);
      result.totalPlayer = result.leaderBoard.length;
      result.leaderBoard = result.leaderBoard.slice(0, 50);
      return result;
    }
    throw new D2MBadRequestException('Cannot find user');
  }

  async resetRank(type: ResetType): Promise<void> {
    switch (type) {
      case ResetType.DAY:
        await this.userGameInfoRepository
          .createQueryBuilder()
          .update(UserGameInfo)
          .set({
            scoreDay: 0,
            scoreComboStreakDay: 0,
            timeAnswerDay: 0,
            timeAnswerStreakDay: 0,
            isDailyReward: true,
          })
          .execute();
        break;
      case ResetType.WEEK:
        await this.userGameInfoRepository
          .createQueryBuilder()
          .update(UserGameInfo)
          .set({
            scoreWeek: 0,
            scoreComboStreakWeek: 0,
            timeAnswerWeek: 0,
            timeAnswerStreakWeek: 0,
          })
          .execute();
        break;
      case ResetType.MONTH:
        await this.userGameInfoRepository
          .createQueryBuilder()
          .update(UserGameInfo)
          .set({
            scoreMonth: 0,
            scoreComboStreakMonth: 0,
            timeAnswerStreakMonth: 0,
            timeAnswerMonth: 0,
          })
          .execute();
        break;
      default:
        break;
    }
  }

  async betGame(userId: string, rubyBet: number): Promise<void> {
    const info = await this.userGameInfoRepository.findOneByOrFail({ userId });
    if (info) {
      await this.update(info.id, { ruby: info.ruby - rubyBet });
    } else {
      throw new Error('Info not exists');
    }
  }

  async uploadAvatar(user: User, avatar: string): Promise<UserGameInfo | null> {
    const userInfo = await this.findOne({ userId: user.id });
    if (userInfo) {
      return this.update(userInfo.id, { avatar });
    }
    throw new Error('User not exists');
  }

  async changeName(user: User, newName: string): Promise<UserGameInfo | null> {
    const userInfo = await this.findOne({ userId: user.id });
    if (userInfo) {
      return this.update(userInfo.id, { userName: newName });
    }
    throw new Error('User not exists');
  }

  async upgradeAmbassadorLevel(user: User): Promise<UserGameInfo | null> {
    const userInfo = await this.getUserByUserId(user.id);
    if (userInfo) {
      const nextLevel = userInfo.ambassadorLevel + 1;
      const config = await this.configService.findWithTag(AMBASSADOR_CONFIG_TAG);
      if (config) {
        const upgradeAmbassadorLevel: UpgradeAmbassadorConfig[] = JSON.parse(config.config);
        if (userInfo.amountSaveLifeUsed < upgradeAmbassadorLevel[nextLevel].saveAmountUsed) {
          throw new D2MBadRequestException('Không đủ số lần sử dụng cứu mạng để nâng cáp!');
        }
        if (userInfo.amountHelp50Used < upgradeAmbassadorLevel[nextLevel].help50AmountUsed) {
          throw new D2MBadRequestException('Không đủ số lần sử dụng trợ giúp 50:50 để nâng cáp!');
        }
        if (userInfo.ruby < upgradeAmbassadorLevel[nextLevel].value) {
          throw new D2MBadRequestException('Không đủ ruby để nâng cáp!');
        }

        return this.update(userInfo.id, {
          ruby: userInfo.ruby - upgradeAmbassadorLevel[nextLevel].value,
          ambassadorLevel: nextLevel,
        });
      }
    }
    throw new Error('User info not exists');
  }

  async getUserDataGameInfo(userId: string): Promise<UserGameDataInfo> {
    const result = new UserGameDataInfo();
    const users = await this.findAll();

    users.sort((x, y) => y.scoreDay - x.scoreDay);
    result.rankDay = users.findIndex((x) => x.userId === userId);

    users.sort((x, y) => y.scoreWeek - x.scoreWeek);
    result.rankWeek = users.findIndex((x) => x.userId === userId);

    users.sort((x, y) => y.scoreMonth - x.scoreMonth);
    result.rankMonth = users.findIndex((x) => x.userId === userId);

    result.ambassadorLevel = users[result.rankMonth].ambassadorLevel;
    result.userName = users[result.rankMonth].userName;
    result.correctAnswer = users[result.rankMonth].correctAnswer;
    result.errorAnswer = users[result.rankMonth].errorAnswer;
    result.avatar = users[result.rankMonth].avatar;
    result.ruby = users[result.rankMonth].ruby;
    return result;
  }
}
