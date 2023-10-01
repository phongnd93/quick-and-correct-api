import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { D2MUnauthorizedException } from 'src/common/infra-exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): any {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any): any {
    if (info instanceof jwt.TokenExpiredError) {
      throw new D2MUnauthorizedException('Token expired');
    }
    if (err || !user) {
      throw new D2MUnauthorizedException(err?.message ?? 'Unauthorized user');
    }
    return user;
  }
}
