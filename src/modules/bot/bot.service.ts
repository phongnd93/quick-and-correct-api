import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { Bot } from 'database/entities';
import { CreateBotRequest } from './dtos/createBot.dto';
import { UserGameInfoService } from '../userGameInfo/userGameInfo.service';
import { UpdateBotDto } from './dtos/updateBot.dto';

@Injectable()
export class BotService extends BaseService<Bot> {
  constructor(
    @InjectRepository(Bot)
    private botRepository: Repository<Bot>,
    // private roomService:RoomService,
    private userGameInfoService: UserGameInfoService,
  ) {
    super(botRepository);
  }

  async findByIdOrFail(id: string): Promise<Bot> {
    return this.botRepository.findOneByOrFail({ id });
  }

  async joinRoom(botId: string, roomId: string): Promise<void> {
    const bot = await this.findByIdOrFail(botId);
    if (bot) {
      await this.update(botId, { roomId });
    }
  }

  async createBot(data: CreateBotRequest): Promise<void> {
    const bot = await this.create({
      star: data.star,
      categoryId: data.categoryId,
      roomId: '',
      userGamepInfoId: '',
    });
    const gameInfoId = await this.userGameInfoService.createBotGameInfo(bot);
    await this.update(bot.id, { userGamepInfoId: gameInfoId });
  }

  async updateBot(botId: string, updateBotDto: UpdateBotDto): Promise<void> {
    const gameInfoId = await this.userGameInfoService.findById(botId);
    if (gameInfoId) {
      await this.userGameInfoService.update(gameInfoId.id, {
        avatar: updateBotDto.avatar,
        userName: updateBotDto.name,
      });
    }
  }
}
