/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  @Inject('winston')
  private readonly logger: Logger;

  use(request: Request | any, response: Response, next: NextFunction): void {
    if (process.env.DISABLE_LOG_REQUEST !== 'true') {
      const { method, originalUrl, body } = request;
      const userAgent = request.get('user-agent') || '';
      const ip = request.get('X-Real-IP') || '';
      const now = Date.now();
      const requestId = v4();

      const message: string = `Request - ${method} - ${originalUrl} - ${userAgent} - ${ip}`;
      this.logger.info(message, {
        body,
        requestId,
        timestamp: new Date(now).toISOString(),
      });

      response.on('finish', () => {
        const { statusCode } = response;
        const executeTime = Date.now() - now;
        this.logger.info(
          `Response - ${method} - ${originalUrl} - ${statusCode} - ${executeTime}ms - ${userAgent} ${ip}`,
          { requestId },
        );
      });
    }
    next();
  }
}
