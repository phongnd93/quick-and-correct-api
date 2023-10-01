import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { Room } from 'database/entities/room.entity';
import { Bot, Question, User } from 'database/entities';
import { RoomType } from 'database/enums/room-type';
import { QuestionType } from 'database/enums/question-type';
import { randomInt } from 'crypto';
import { UserGameInfo } from 'database/entities/userGameInfo.entity';
import { AMBASSADOR_CONFIG_TAG } from 'src/common/constanst/gameConstant';
import { D2MBadRequestException } from 'src/common/infra-exception';
import { AnswerRequest } from './dtos/answerRequest.dto';
import { RoomProcessing } from './dtos/roomProcessing.dto';
import { QuestionService } from '../question/question.service';
import { GetQuestionRequest } from './dtos/getQuestionRequest.dto';
import { QuestionResult } from '../question/dtos/questionResult.dto';
import { UserGameInfoService } from '../userGameInfo/userGameInfo.service';
import { RoomCreateRequest } from './dtos/roomCreateRequest.dto';
import { QuestionDto } from '../question/dtos/question.dto';
import { BotService } from '../bot/bot.service';
import { ConfigGameService } from '../config/configGame.service';
import { UpgradeAmbassadorConfig } from '../config/dtos/upgradeAmbassadorConfig.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class RoomService extends BaseService<Room> {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private questionService: QuestionService,
    private userGameInfoService: UserGameInfoService,
    private botService: BotService,
    private configGameService: ConfigGameService,
    private categoryService: CategoryService,
  ) {
    super(roomRepository);
  }

  async findByIdOrFail(id: string): Promise<Room> {
    return this.roomRepository.findOneByOrFail({ id });
  }

  async createRoom(dataCreate: RoomCreateRequest, user: User): Promise<Room> {
    const userInfo = await this.userGameInfoService.getUserByUserId(user.id);
    if (userInfo) {
      if (dataCreate.type === RoomType.BET && userInfo.ruby < dataCreate.rubyBet) {
        throw new D2MBadRequestException('Bạn không đủ ruby để tạo phòng!');
      }
      const firstQuestionId = await this.GetFirstQuestionId();
      const processing: RoomProcessing[] = [];
      processing.push(await this.getInitUserRoomData(userInfo));
      const maxQuestion =
        !dataCreate.password || dataCreate.password.length === 0 ? -1 : dataCreate.amountQuestion;
      const dataIntergrate = {
        processing: JSON.stringify(processing),
        questionId: '',
        type: dataCreate.type,
        password: dataCreate.password,
        amountQuestion: dataCreate.amountQuestion,
        amountPlayer: processing.length,
        maxPlayer: dataCreate.maxPlayer,
        rubyBet: dataCreate.rubyBet,
        maxQuestion,
        totalRubyBet: 0,
        currentQuestion: 0,
        roomName: dataCreate.roomName,
        nextQuestion: firstQuestionId || '',
      };
      const data = await this.create(dataIntergrate);
      return data;
    }
    throw new Error('User not exists');
  }

  async GetFirstQuestionId(): Promise<string> {
    const categories = (await this.categoryService.findAll()).filter((x) => x.active);
    categories.sort((x, y) => x.priority - y.priority);
    const question = await this.questionService.GetQuestion(categories[0].id);
    if (question) {
      return question.id;
    }
    throw new D2MBadRequestException('Can not get first question');
  }

  async checkOldRoom(user: User): Promise<void> {
    const listRoom = await this.findAll();
    await Promise.all(
      listRoom.map(async (x) => {
        const processing: RoomProcessing[] = JSON.parse(x.processing);
        const oldData = processing.findIndex((process) => process.userId === user.id);
        if (oldData >= 0) {
          processing.splice(oldData, 1);
          if (processing.length > 0) {
            await this.update(x.id, {
              processing: JSON.stringify(processing),
              amountPlayer: processing.length,
            });
          } else if (x.maxPlayer < 6) {
            await this.delete(x.id);
          }
        }
      }),
    );
  }

  async getInitUserRoomData(userInfo: UserGameInfo): Promise<RoomProcessing> {
    const dataAmbassador = await this.configGameService.findWithTag(AMBASSADOR_CONFIG_TAG);
    if (dataAmbassador) {
      const configAmbassador: UpgradeAmbassadorConfig[] = JSON.parse(dataAmbassador.config);
      const help =
        userInfo.amountHelp50 < configAmbassador[userInfo.ambassadorLevel].helpNumber
          ? userInfo.amountHelp50
          : configAmbassador[userInfo.ambassadorLevel].helpNumber;
      const save =
        userInfo.amountSaveLife < configAmbassador[userInfo.ambassadorLevel].saveNumber
          ? userInfo.amountSaveLife
          : configAmbassador[userInfo.ambassadorLevel].saveNumber;
      return {
        userId: userInfo.userId,
        userName: userInfo ? userInfo.userName : '',
        isStreak: false,
        currentStreak: 0,
        oldStreak: 0,
        timeAnswer: 0,
        answer: '',
        currentCorrect: 0,
        currentHelp: help,
        currentSave: save,
        currentRuby: 0,
        totalTime: 0,
        isBot: false,
        isSaved: true,
        ambassadorLevel: userInfo ? userInfo.ambassadorLevel : 0,
        eventName: userInfo.eventName,
      };
    }
    throw new Error('Not configure');
  }

  getInitBotRoomData(userInfo: UserGameInfo): RoomProcessing {
    return {
      userId: userInfo.userId,
      userName: userInfo.userName,
      isStreak: false,
      currentStreak: 0,
      oldStreak: 0,
      timeAnswer: 0,
      currentCorrect: 0,
      answer: '',
      currentHelp: 0,
      currentSave: 0,
      currentRuby: 0,
      totalTime: 0,
      isBot: true,
      isSaved: false,
      ambassadorLevel: userInfo ? userInfo.ambassadorLevel : 0,
      eventName: userInfo.eventName,
    };
  }

  async createRoomBot(dataCreate: RoomCreateRequest, user: Bot): Promise<Room> {
    const userInfo = await this.userGameInfoService.getUserByUserId(user.id);
    const processing: RoomProcessing[] = [];
    if (userInfo) {
      processing.push(this.getInitBotRoomData(userInfo));
      const dataIntergrate = {
        processing: JSON.stringify(processing),
        questionId: '',
        type: dataCreate.type,
        password: dataCreate.password,
        amountQuestion: dataCreate.amountQuestion,
        amountPlayer: processing.length,
        maxPlayer: dataCreate.maxPlayer,
        rubyBet: dataCreate.rubyBet,
        totalRubyBet: 0,
        currentQuestion: 0,
        roomName: dataCreate.roomName,
      };
      const data = await this.create(dataIntergrate);
      return data;
    }
    throw new Error('User not exist');
  }

  async joinRoom(user: User, room: Room): Promise<Room> {
    console.log('jj');
    if (room.amountPlayer >= room.maxPlayer) {
      throw new D2MBadRequestException('Phòng đã đầy, xin chôn phòng khác!');
    }
    const processing: RoomProcessing[] = JSON.parse(room.processing);
    const currentAnswer = processing.findIndex((x) => x.userId === user.id);
    if (currentAnswer < 0) {
      const userInfo = await this.userGameInfoService.GetUserGameInfo(user);
      if (room.rubyBet > 0 && userInfo.ruby < room.rubyBet) {
        throw new D2MBadRequestException('Bạn không đủ ruby để tham gia');
      }
      processing.push(await this.getInitUserRoomData(userInfo));
    } else {
      const userInfo = await this.userGameInfoService.GetUserGameInfo(user);
      processing[currentAnswer] = await this.getInitUserRoomData(userInfo);
    }
    const result = await this.update(room.id, {
      processing: JSON.stringify(processing),
      amountPlayer: processing.length,
    });
    if (result) {
      return result;
    }

    throw new D2MBadRequestException('Không thể vào phòng');
  }

  async joinRoomBot(bot: Bot, room: Room): Promise<void> {
    const processing: RoomProcessing[] = JSON.parse(room.processing);
    const currentAnswer = processing.findIndex((x) => x.userId === bot.id);
    if (currentAnswer < 0) {
      const userInfo = await this.userGameInfoService.getUserByUserId(bot.id);
      if (userInfo) {
        processing.push(this.getInitBotRoomData(userInfo));
        await this.update(room.id, {
          processing: JSON.stringify(processing),
          amountPlayer: processing.length,
        });
      }
    }
  }

  async checkJoinRoom(roomId: string, user: User, password: string): Promise<Room> {
    const room = await this.findByIdOrFail(roomId);
    const userGameInfo = await this.userGameInfoService.getUserByUserId(user.id);
    if (userGameInfo) {
      if (
        userGameInfo.ruby >= room.rubyBet &&
        (password === room.password || room.password.length === 0) &&
        room.amountPlayer < room.maxPlayer
      ) {
        await this.joinRoom(user, room);
        return room;
      }

      if (password !== room.password) {
        throw new Error('Password not correct!');
      } else if (userGameInfo.ruby < room.rubyBet) {
        throw new Error('Ruby insufficient!');
      } else if (room.amountPlayer >= room.maxPlayer) {
        throw new Error('Room full!');
      } else {
        throw new Error('Cannot join room!');
      }
    } else {
      throw new Error('Not found info user!');
    }
  }

  async botQuickplay(bot: Bot): Promise<void> {
    let isRoomAvailable = false;
    const rooms = await this.findAll();
    if (rooms && rooms.length > 0) {
      const roomAvailable = rooms.filter((room) => {
        return room.amountPlayer < 3 && room.type === RoomType.NORMAL && room.password.length === 0;
      });
      if (roomAvailable.length > 0) {
        await this.joinRoomBot(bot, roomAvailable[0]);
        await this.botService.update(bot.id, { roomId: roomAvailable[0].id });
        isRoomAvailable = true;
      }
    }
    if (!isRoomAvailable) {
      const room = await this.createRoomBot(
        {
          type: RoomType.NORMAL,
          maxPlayer: 6,
          roomName: 'Chơi Nhanh',
          amountQuestion: -1,
          password: '',
          rubyBet: 0,
        },
        bot,
      );
      await this.botService.update(bot.id, { roomId: room.id });
    }

    // throw new Error('Cannot play');
  }

  async quickplay(user: User): Promise<Room> {
    const isRoomAvailable = false;
    const rooms = await this.findAll();
    if (rooms && rooms.length > 0) {
      const roomAvailable = rooms.filter((room) => {
        return (
          room.amountPlayer < room.maxPlayer &&
          room.type === RoomType.NORMAL &&
          room.password.length === 0 &&
          room.maxQuestion < 0
        );
      });
      if (roomAvailable.length > 0) {
        return this.joinRoom(user, roomAvailable[0]);
      }
    }
    if (!isRoomAvailable) {
      const roomNew = await this.createRoom(
        {
          type: RoomType.NORMAL,
          maxPlayer: 6,
          roomName: 'Chơi Nhanh',
          amountQuestion: -1,
          password: '',
          rubyBet: 0,
        },
        user,
      );
      return roomNew;
    }
    throw new Error('Cannot play');
  }

  getBotCorrect(bot: Bot, question: QuestionDto): boolean {
    let correctRate = 0;
    if (bot.categoryId === question.categoryId) {
      correctRate += 20;
    }
    correctRate += bot.star * 10;
    const randNum = Math.floor(Math.random() * 100) % 100;
    return randNum <= correctRate;
  }

  getErrorAnswer(result: string): string {
    let resultReturn = '';
    resultReturn = result.slice(0, randomInt(0, result.length - 3));
    return resultReturn;
  }

  async getSaveQuestion(user: User, roomId: string): Promise<void> {
    const userInfo = await this.userGameInfoService.getUserByUserId(user.id);
    if (userInfo && userInfo.amountSaveLife > 0) {
      const room = await this.findById(roomId);
      if (room) {
        const processing: RoomProcessing[] = JSON.parse(room.processing);
        const userIndex = processing.findIndex((x) => x.userId === user.id);
        if (processing[userIndex].currentSave <= 0) {
          throw new Error('Save insufficient');
        }
        if (userIndex >= 0) {
          processing[userIndex].isSaved = true;
          processing[userIndex].currentSave -= 1;
          await this.update(roomId, { processing: JSON.stringify(processing) });
          await this.userGameInfoService.update(userInfo.id, {
            amountSaveLife: userInfo.amountSaveLife - 1,
            amountSaveLifeUsed: userInfo.amountHelp50Used + 1,
          });
          return;
        }
      }
    }
    throw new Error('Help not available!');
  }

  async getHelpQuestion(user: User, roomId: string): Promise<string[]> {
    const userInfo = await this.userGameInfoService.getUserByUserId(user.id);
    if (userInfo && userInfo.amountHelp50 > 0) {
      const result: string[] = [];
      const room = await this.findById(roomId);
      if (room) {
        const roomProcessing: RoomProcessing[] = JSON.parse(room.processing);
        const userIndex = roomProcessing.findIndex((x) => x.userId === user.id);
        if (roomProcessing[userIndex].currentHelp <= 0) {
          throw new Error('Help insufficient');
        }
        if (userIndex >= 0) {
          roomProcessing[userIndex].currentHelp -= 1;
          const question = await this.questionService.findById(room.questionId);
          switch (question.questionType) {
            case QuestionType.IMAGE:
            case QuestionType.TEXT: {
              result.push(question.result);
              const randomResult = ['1', '2', '3', '4'].filter((x) => x !== question.result);
              const randomIndex = randomInt(0, 100);
              if (randomIndex < 34) {
                result.push(randomResult[0]);
              } else if (randomIndex > 34 && randomIndex < 68) {
                result.push(randomResult[1]);
              } else {
                result.push(randomResult[2]);
              }
              break;
            }
            case QuestionType.VIETNNAMESEKING: {
              const indexs: number[] = [];
              indexs.push(randomInt(0, question.result.length - 1));
              while (indexs.length < 3) {
                const random = randomInt(0, question.result.length - 1);
                if (indexs.findIndex((x) => x === random) < 0) {
                  indexs.push(random);
                }
              }
              for (let i = 0; i < question.result.length; i += 1) {
                if (indexs.findIndex((x) => x === i) >= 0) {
                  result.push(question.result[i]);
                } else {
                  result.push(' ');
                }
              }
              break;
            }
            default: {
              break;
            }
          }
          await this.update(roomId, { processing: JSON.stringify(roomProcessing) });
          await this.userGameInfoService.update(userInfo.id, {
            amountHelp50: userInfo.amountHelp50 - 1,
            amountHelp50Used: userInfo.amountHelp50Used + 1,
          });
        }
        return result;
      }
    }
    throw new Error('Help not available!');
  }

  async getQuestion(data: GetQuestionRequest): Promise<QuestionDto> {
    const room = await this.findById(data.roomId);
    let question: QuestionDto = new QuestionDto();

    let numberQuestion = room.amountQuestion;
    if (numberQuestion === 0 && room.maxQuestion > 0) {
      numberQuestion = room.maxQuestion;
    }

    const infos = await this.userGameInfoService.findAll();
    if (numberQuestion < 0 || numberQuestion > 0) {
      const categories = (await this.categoryService.findAll()).filter((x) => x.active);
      categories.sort((x, y) => x.priority - y.priority);
      const priortyField: number[] = categories.map((x) => {
        return x.priority;
      });

      let checkIndex = Math.max(
        0,
        priortyField.findIndex((priorty) => priorty === room.currentPrioty),
      );
      room.currentPrioty = priortyField[checkIndex];

      const category = categories.find((cate) => {
        return cate.priority === room.currentPrioty;
      });

      if (priortyField && priortyField.length > 0) {
        checkIndex += 1;
        if (checkIndex >= priortyField.length) {
          checkIndex = 0;
        }
        room.currentPrioty = priortyField[checkIndex];
      }

      if (category) {
        if (room.nextQuestion != null && room.nextQuestion.length > 0) {
          question = await this.questionService.GetQuestionById(room.nextQuestion);
        } else {
          question = await this.questionService.GetQuestion(category.id);
        }
        const categoryNext = categories.find((cate) => {
          return cate.priority === room.currentPrioty;
        });
        if (categoryNext) {
          question.nextQuestion = (await this.questionService.GetQuestion(categoryNext.id)).id;
        }
        if (!question) {
          throw new D2MBadRequestException('No question found');
        }
      } else {
        throw new D2MBadRequestException('No category found');
      }

      if (room) {
        let processing: RoomProcessing[] = JSON.parse(room.processing);
        if (room.type === RoomType.BET) {
          room.totalRubyBet = 0;
          const pros: Promise<void>[] = [];
          const userContinue: RoomProcessing[] = [];
          processing.map((process) => {
            const userinfo = infos.find((info) => info.userId === process.userId);
            if (userinfo && userinfo.ruby >= room.rubyBet) {
              userContinue.push(process);
              pros.push(this.userGameInfoService.betGame(process.userId, room.rubyBet));
              userContinue[userContinue.length - 1].currentRuby =
                process.currentRuby - room.rubyBet;
              room.totalRubyBet += room.rubyBet;
            }
            return process;
          });
          processing = userContinue;
          await Promise.all(pros);
        } else {
          room.totalRubyBet = processing.length;
        }
        const outputProcess: RoomProcessing[] = [];
        const bots = await this.botService.findAll();
        processing.map((process) => {
          if (process.isBot) {
            let timeAnswer = (Math.floor(Math.random() * 10000) % 10000) + 500;
            timeAnswer = Math.min(timeAnswer, (question.star * 10 - 2) * 1000);
            let answer = '';
            const bot = bots.find((cbot) => cbot.id === process.userId);
            if (bot) {
              const isCorrect = this.getBotCorrect(bot, question);
              if (!isCorrect) {
                switch (question.questionType) {
                  case QuestionType.IMAGE:
                  case QuestionType.TEXT: {
                    const answers = ['1', '2', '3', '4'].filter((x) => x !== question.result);
                    answer = answers[randomInt(0, answers.length)];
                    break;
                  }
                  case QuestionType.VIETNNAMESEKING: {
                    if (question.result) {
                      answer = this.getErrorAnswer(question.result);
                    }
                    break;
                  }
                  default:
                    break;
                }
              } else if (question.result) {
                answer = question.result;
              }
            }

            outputProcess.push({
              userId: process.userId,
              answer,
              userName: process.userName,
              isStreak: process.isStreak,
              timeAnswer,
              oldStreak: process.oldStreak,
              currentStreak: process.currentStreak,
              currentRuby: process.currentRuby,
              currentSave: process.currentSave,
              currentHelp: process.currentHelp,
              currentCorrect: process.currentCorrect,
              totalTime: process.totalTime,
              isBot: true,
              isSaved: false,
              ambassadorLevel: process.ambassadorLevel,
              eventName: process.eventName,
            });
          } else {
            outputProcess.push({
              userId: process.userId,
              answer: '',
              userName: process.userName,
              isStreak: process.isStreak,
              timeAnswer: Number.MAX_SAFE_INTEGER,
              oldStreak: process.oldStreak,
              currentStreak: process.currentStreak,
              currentRuby: process.currentRuby,
              currentHelp: process.currentHelp,
              currentSave: process.currentSave,
              totalTime: process.totalTime,
              currentCorrect: process.currentCorrect,
              ambassadorLevel: process.ambassadorLevel,
              isBot: false,
              isSaved: false,
              eventName: process.eventName,
            });
          }
          return process;
        });

        await this.update(room.id, {
          questionId: question.id,
          startQuestionTime: new Date(Date.now()),
          currentQuestion: room.currentQuestion + 1,
          totalRubyBet: room.totalRubyBet,
          processing: JSON.stringify(outputProcess),
          currentPrioty: room.currentPrioty,
          amountQuestion: room.maxQuestion > 0 ? numberQuestion - 1 : room.maxQuestion,
          nextQuestion: question.nextQuestion ? question.nextQuestion : '',
        });
        question.users = outputProcess;
        return question;
      }
    }
    throw new Error('Room not available');
  }

  async getResult(data: GetQuestionRequest): Promise<QuestionResult> {
    const room = await this.findById(data.roomId);
    if (room) {
      // if (room.type === RoomType.BET) {
      //   const processing: RoomProcessing[] = JSON.parse(room.processing);
      //   await Promise.all(
      //     processing.map(async (process) => {
      //       this.userGameInfoService.betGame(process.userId, room.rubyBet);
      //       room.totalRubyBet += room.rubyBet;
      //     }),
      //   );
      // }
      const question = await this.questionService.findById(room.questionId);
      let oututProcessing: RoomProcessing[] = [];
      if (room.type === RoomType.NORMAL) {
        oututProcessing = await this.processResultRoomNormal(room, question);
      } else if (room.type === RoomType.BET) {
        oututProcessing = await this.processResultRoomBet(room, question);
      }
      const questionResult = new QuestionResult();
      questionResult.result = question.result;
      questionResult.users = oututProcessing;
      questionResult.amountQuestion = room.amountQuestion;
      await this.update(room.id, {
        processing: JSON.stringify(oututProcessing),
        amountPlayer: oututProcessing.length,
      });
      return questionResult;
    }

    throw new Error('Room not available');
  }

  async processResultRoomBet(room: Room, question: Question): Promise<RoomProcessing[]> {
    const processing: RoomProcessing[] = JSON.parse(room.processing);
    const oututProcessing: RoomProcessing[] = [];
    processing.sort((x, y) => x.timeAnswer - y.timeAnswer);
    let isGottenBet = false;
    await Promise.all(
      processing.map(async (process) => {
        if (process.answer === question.result && !isGottenBet) {
          oututProcessing.splice(0, 1, {
            userId: process.userId,
            answer: process.answer,
            userName: process.userName,
            isStreak: true,
            timeAnswer: process.timeAnswer,
            oldStreak: 0,
            currentStreak: 0,
            totalTime: process.totalTime + process.timeAnswer,
            currentHelp: process.currentHelp,
            currentSave: process.currentSave,
            currentRuby: process.currentRuby + room.totalRubyBet,
            currentCorrect: process.currentCorrect + 1,
            isBot: false,
            isSaved: process.isSaved,
            ambassadorLevel: process.ambassadorLevel,
            eventName: process.eventName,
          });
          isGottenBet = true;
        } else {
          oututProcessing.push({
            userId: process.userId,
            answer: process.answer,
            userName: process.userName,
            isStreak: true,
            timeAnswer: process.timeAnswer,
            oldStreak: 0,
            currentStreak: 0,
            currentHelp: process.currentHelp,
            currentSave: process.currentSave,
            currentRuby: process.currentRuby,
            totalTime: process.totalTime,
            currentCorrect: process.currentCorrect,
            isBot: false,
            isSaved: process.isSaved,
            ambassadorLevel: process.ambassadorLevel,
            eventName: process.eventName,
          });
        }
      }),
    );
    if (oututProcessing.length > 0) {
      await this.userGameInfoService.addScore(
        room.totalRubyBet,
        0,
        oututProcessing[0].userId,
        oututProcessing[0].timeAnswer / 1000,
        false,
      );
    }
    return oututProcessing;
  }

  async processResultRoomNormal(room: Room, question: Question): Promise<RoomProcessing[]> {
    const processing: RoomProcessing[] = JSON.parse(room.processing);
    const oututProcessing: RoomProcessing[] = [];
    const correctProcessing: RoomProcessing[] = [];
    processing.sort((x, y) => x.timeAnswer - y.timeAnswer);
    let ruby = room.totalRubyBet;
    await Promise.all(
      processing.map(async (process) => {
        if (process.answer.trim() === question.result.trim()) {
          if (process.isStreak) {
            oututProcessing.push({
              userId: process.userId,
              answer: process.answer,
              userName: process.userName,
              isStreak: true,
              timeAnswer: process.timeAnswer,
              oldStreak:
                process.currentStreak + 1 > process.oldStreak
                  ? process.currentStreak + 1
                  : process.oldStreak,
              currentStreak: process.currentStreak + 1,
              currentRuby: process.currentRuby + ruby,
              totalTime: process.totalTime + process.timeAnswer,
              currentHelp: process.currentHelp,
              currentCorrect: process.currentCorrect + 1,
              currentSave: process.currentSave,
              isBot: process.isBot,
              isSaved: process.isSaved,
              ambassadorLevel: process.ambassadorLevel,
              eventName: process.eventName,
            });
          } else {
            oututProcessing.push({
              userId: process.userId,
              answer: process.answer,
              userName: process.userName,
              isStreak: true,
              timeAnswer: process.timeAnswer,
              oldStreak: process.oldStreak,
              currentStreak: 1,
              currentRuby: process.currentRuby + ruby,
              totalTime: process.totalTime + process.timeAnswer,
              currentHelp: process.currentHelp,
              currentSave: process.currentSave,
              currentCorrect: process.currentCorrect + 1,
              isBot: process.isBot,
              isSaved: process.isSaved,
              ambassadorLevel: process.ambassadorLevel,
              eventName: process.eventName,
            });
          }
          const rubyUdate = ruby;
          ruby -= 1;
          correctProcessing.push(oututProcessing[oututProcessing.length - 1]);
          await this.userGameInfoService.addScore(
            rubyUdate,
            oututProcessing[oututProcessing.length - 1].oldStreak,
            oututProcessing[oututProcessing.length - 1].userId,
            process.timeAnswer / 1000,
            true,
          );
        } else {
          if (room.password.length > 0 || process.isSaved) {
            oututProcessing.push({
              userId: process.userId,
              answer: process.answer,
              userName: process.userName,
              isStreak: false,
              timeAnswer: -1,
              oldStreak: 0,
              currentStreak: process.isSaved ? process.currentStreak : 0,
              currentRuby: process.currentRuby,
              currentHelp: process.currentHelp,
              totalTime: process.totalTime,
              currentSave: process.currentSave,
              currentCorrect: process.currentCorrect,
              isBot: process.isBot,
              isSaved: process.isSaved,
              ambassadorLevel: process.ambassadorLevel,
              eventName: process.eventName,
            });

            correctProcessing.push(oututProcessing[oututProcessing.length - 1]);
          }
          await this.userGameInfoService.errorAnswer(process.userId);
          if (process.isBot) {
            await this.botLeftRoom(process.userId);
          }
        }
      }),
    );
    // }
    if (room.password || room.password.length > 0) {
      return oututProcessing;
    }
    return correctProcessing;
  }

  async botLeftRoom(botId: string): Promise<void> {
    await this.botService.update(botId, { roomId: '' });
  }

  async leftRoom(user: User, roomId: string): Promise<void> {
    const room = await this.findByIdOrFail(roomId);
    if (room) {
      const processing: RoomProcessing[] = JSON.parse(room.processing);
      if (processing.length > 0) {
        const userIndex = processing.findIndex((x) => x.userId === user.id);
        if (userIndex >= 0) {
          processing.splice(userIndex, 1);
          const amount = processing.length;
          await this.update(room.id, {
            processing: JSON.stringify(processing),
            amountPlayer: amount,
          });
        }
      }
    } else {
      throw new Error('Cannot find room');
    }
  }

  async answerQuestion(user: User, answer: AnswerRequest): Promise<void> {
    const room = await this.findByIdOrFail(answer.roomId);
    const processing: RoomProcessing[] = JSON.parse(room.processing);
    const timeAnswer =
      room.startQuestionTime != null ? Date.now() - room.startQuestionTime.getTime() : -1;
    const currentAnswer = processing.findIndex((x) => x.userId === user.id);
    if (currentAnswer >= 0) {
      const userInfo = processing[currentAnswer];
      processing[currentAnswer] = {
        userId: userInfo.userId,
        answer: answer.answer,
        timeAnswer,
        isStreak: userInfo.isStreak,
        oldStreak: userInfo.oldStreak,
        currentStreak: userInfo.currentStreak,
        userName: userInfo.userName,
        currentRuby: userInfo.currentRuby,
        totalTime: userInfo.totalTime,
        currentHelp: userInfo.currentHelp,
        currentSave: userInfo.currentSave,
        currentCorrect: userInfo.currentCorrect,
        isBot: false,
        isSaved: userInfo.isSaved,
        ambassadorLevel: userInfo.ambassadorLevel,
        eventName: userInfo.eventName,
      };

      await this.update(room.id, {
        processing: JSON.stringify(processing),
        amountPlayer: processing.length,
      });
    } else {
      throw new D2MBadRequestException('User not exists in room!');
    }
  }

  async getRooms(): Promise<Room[]> {
    const rooms = await this.findAll();
    return rooms.filter((x) => x.amountPlayer > 0);
  }

  async workerCheckJoinRoom(): Promise<void> {
    const botAvailableRoom = (await this.botService.findAll()).filter(
      (x) => !x.roomId || x.roomId.length === 0,
    );
    if (botAvailableRoom.length > 0) {
      const rooms = (await this.findAll()).filter((room) => {
        return (
          room.amountPlayer < 2 &&
          room.maxPlayer >= 4 &&
          room.type === RoomType.NORMAL &&
          room.password.length === 0
        );
      });
      const listInfos = await this.userGameInfoService.findAll();
      if (rooms.length > 0) {
        const promiseRoom: Promise<any>[] = [];
        const pros: Promise<any>[] = [];

        rooms.map((room) => {
          if (room && botAvailableRoom.length > 0) {
            const processing: RoomProcessing[] = JSON.parse(room.processing);
            const roomMax = randomInt(2, room.maxPlayer - 1);
            for (let i = 0; i < roomMax; i += 1) {
              const bot = botAvailableRoom[0];
              const currentIndex = processing.findIndex((x) => x.userId === bot.id);
              pros.push(this.botService.update(bot.id, { roomId: room.id }));
              if (currentIndex < 0) {
                const info = listInfos.find((x) => x.userId === bot.id);
                processing.push({
                  userId: bot.id,
                  answer: '',
                  timeAnswer: 0,
                  isStreak: false,
                  oldStreak: 0,
                  currentStreak: 0,
                  userName: info ? info.userName : '',
                  currentRuby: 0,
                  currentCorrect: 0,
                  totalTime: 0,
                  isBot: true,
                  currentHelp: 0,
                  currentSave: 0,
                  isSaved: true,
                  ambassadorLevel: info ? info.ambassadorLevel : 1,
                  eventName: '',
                });
              }
              botAvailableRoom.splice(0, 1);
              if (processing.length > roomMax || botAvailableRoom.length === 0) {
                break;
              }
            }
            promiseRoom.push(
              this.update(room.id, {
                processing: JSON.stringify(processing),
                amountPlayer: processing.length,
              }),
            );
          }
          return room;
        });
        await Promise.all(pros);
        await Promise.all(promiseRoom);
      } else {
        const processing: RoomProcessing[] = [];
        const bot = await this.userGameInfoService.findById(botAvailableRoom[0].userGamepInfoId);
        if (bot) {
          processing.push(this.getInitBotRoomData(bot));
        }
        const firstQuestionId = await this.GetFirstQuestionId();
        const dataIntergrate = {
          processing: JSON.stringify(processing),
          questionId: '',
          type: RoomType.NORMAL,
          password: '',
          amountQuestion: -1,
          amountPlayer: 0,
          maxQuestion: -1,
          maxPlayer: 6,
          rubyBet: 0,
          totalRubyBet: 0,
          currentQuestion: 0,
          roomName: 'Chơi Nhanh',
          nextQuestion: firstQuestionId || '',
        };
        await this.create(dataIntergrate);
      }
    }
  }

  async kickUserInRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.findById(roomId);
    if (room) {
      const processing: RoomProcessing[] = JSON.parse(room.processing);

      const index = processing.findIndex((x) => x.userId === userId);
      if (index >= 0) {
        processing.splice(index, 0);
        await this.update(roomId, { processing: JSON.stringify(processing) });
      } else {
        throw new Error('User not exists');
      }
    } else {
      throw new Error('Room not exists');
    }
  }
}
