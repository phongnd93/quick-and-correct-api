import { DataSource } from 'typeorm';
import { runSeeder, Seeder } from 'typeorm-extension';
import UserSeed from './user.seed';

export class MainSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await runSeeder(dataSource, UserSeed);
  }
}
