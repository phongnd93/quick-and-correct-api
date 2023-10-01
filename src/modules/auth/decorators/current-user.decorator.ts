import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext): any => {
    const req = ctx.switchToHttp().getRequest();
    if (key) {
      return req.user[key];
    }
    return req.user;
  },
);
