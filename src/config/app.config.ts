import { registerAs } from '@nestjs/config';
import { CookieOptions } from 'express';

export default registerAs('app', () => ({
  appName: process.env.APP_NAME || 'Blox3',
  otpTimeout: parseInt(process.env.OTP_TIMEOUT || '60000', 10), // 1 minute (60000 milisecon)
  corsOrigins: process.env.CORS_ORIGINS || '',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    domain: process.env.COOKIE_DOMAIN || '',
  } as CookieOptions,
}));
