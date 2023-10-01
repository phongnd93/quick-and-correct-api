import { registerAs } from '@nestjs/config';
import { transports } from 'winston';

export default registerAs('log', () => ({
  transports: [
    new transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
}));
