import { User } from 'database/entities';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from 'database/enums';

export default class UserSeed implements Seeder {
  createUser(appDataSource: DataSource): User[] {
    return appDataSource.getRepository(User).create([
      {
        id: '3fd32bc1-d003-45e1-875b-93a0029fee2f',
        email: 'cheng.cit@gmail.com',
        password: bcrypt.hashSync('Password12#', 10),
        status: UserStatus.ACTIVE,
        role: UserRole.USER,
        name: 'Anonymous',
      },
    ]);
  }

  async run(dataSource: DataSource): Promise<void> {
    const users = this.createUser(dataSource);
    await dataSource.getRepository(User).save(users);
  }
}
