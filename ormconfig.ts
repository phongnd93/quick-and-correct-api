import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from 'database/seeds/main.seed';
import { NamingStrategy } from 'database/typeorm';

dotenv.config({
  path: '.env',
});

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [`${__dirname}/database/**/*.entity{.ts,.js}`],
  namingStrategy: new NamingStrategy(),
  migrationsTableName: '__migrations',
  migrations: ['./database/migrations/**/*.ts'],
  seeds: [MainSeeder],
  synchronize: false,
  migrationsRun: true,
  ssl: process.env.NODE_ENV !== 'development',
  extra: {
    connectionLimit: 10,
    ssl:
      process.env.NODE_ENV !== 'development'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
};

export const connectionSource = new DataSource(options);
