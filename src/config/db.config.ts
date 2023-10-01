import { join } from 'path';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NamingStrategy } from 'database/typeorm';

export default registerAs<TypeOrmModuleOptions>('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  autoLoadEntities: true,
  keepConnectionAlive: true,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  namingStrategy: new NamingStrategy(),
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
}));
