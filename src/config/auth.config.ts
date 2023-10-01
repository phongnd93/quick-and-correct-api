import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || '4fLVZarmCIjAzts2P8iypBTIPdEOGYqK',
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION || '7d', // 7 days
}));
