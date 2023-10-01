import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Response, Request } from 'express';
import { Exception, InternalServerError } from 'src/common/infra-exception/exception';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Catch()
export class GlobalHandleExceptionFilter implements ExceptionFilter {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger;

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();

    this.logException(request, exception);

    if (exception instanceof Exception) {
      GlobalHandleExceptionFilter.sendResponse(request, response, exception);
    } else if (exception instanceof HttpException) {
      GlobalHandleExceptionFilter.sendBaseResponse(request, response, exception);
    } else {
      GlobalHandleExceptionFilter.sendResponse(request, response, new InternalServerError());
    }
  }

  private logException(_: Request, exception: HttpException): void {
    if (process.env.DISABLE_LOG_REQUEST !== 'true') {
      this.logger.error({
        ...exception,
        stack: exception.stack,
      });
    }
  }

  private static sendResponse(request: Request, response: Response, exception: Exception): void {
    const traceId = request.header('x-client-trace-id');
    response.status(exception.getStatus()).json(exception.prepareResponse(traceId));
  }

  private static sendBaseResponse(_: Request, response: Response, exception: HttpException): void {
    const { message } = exception;
    const statusCode = exception.getStatus();
    response.status(statusCode).json({ statusCode, message });
  }
}
