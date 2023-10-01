import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services';
import { Leaderboard } from 'database/entities';
import { SortDirection } from 'database/enums';
import { D2MBadRequestException } from 'src/common/infra-exception';
import { UpdateLeaderboard } from './dtos/updateLeaderboard.dto';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard> {
  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
  ) {
    super(leaderboardRepository);
  }

  async findByIdOrFail(id: string): Promise<Leaderboard> {
    return this.leaderboardRepository.findOneByOrFail({ id });
  }

  async updateLeaderboard(updateLeaderboard: UpdateLeaderboard): Promise<Leaderboard[]> {
    await this.update(updateLeaderboard.id, {
      score: updateLeaderboard.score,
      country: updateLeaderboard.country,
    });
    const result = await this.leaderboardRepository.find({
      where: { score: Between(updateLeaderboard.score - 500, updateLeaderboard.score + 500) },
    });
    result.sort((x, y) => {
      return y.score - x.score || x.updatedAt.getTime() - y.updatedAt.getTime();
    });
    const indexPlayer = result.findIndex((x) => x.id === updateLeaderboard.id);
    return result.splice(
      Math.max(0, indexPlayer - 25),
      Math.min(result.length - 1, indexPlayer + 25),
    );
  }

  async updateName(updateLeaderboard: UpdateLeaderboard): Promise<void> {
    await this.update(updateLeaderboard.id, { playerName: updateLeaderboard.name });
  }

  async getPlayerLeaderboard(body: UpdateLeaderboard): Promise<Leaderboard[]> {
    const leaderboard = await this.update(body.id, {
      score: body.score,
      playerName: body.name,
      country: body.country,
    });
    if (leaderboard) {
      const result = await this.leaderboardRepository.find({
        where: { score: Between(leaderboard.score - 500, leaderboard.score + 500) },
      });
      result.sort((x, y) => {
        return y.score - x.score || x.updatedAt.getTime() - y.updatedAt.getTime();
      });
      const indexPlayer = result.findIndex((x) => x.id === leaderboard.id);
      return result.splice(Math.max(0, indexPlayer - 25), 50);
    }

    throw new D2MBadRequestException('Player not exists');
  }

  async getTopTen(): Promise<Leaderboard[]> {
    const query = this.leaderboardRepository
      .createQueryBuilder('leaderboard')
      .orderBy('leaderboard.score', SortDirection.DESC)
      .take(10);
    return query.getMany();
  }
}
