import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { D2MUnauthorizedException } from 'src/common/infra-exception';

@Injectable()
export class JwtResetPasswordGuard extends AuthGuard('jwt-reset-password') {
  handleRequest(err: any, user: any, info: any): any {
    if (info instanceof jwt.TokenExpiredError) {
      throw new D2MUnauthorizedException('OTP expired');
    }
    if (err || !user) {
      throw new D2MUnauthorizedException(err?.message ?? 'Unauthorized');
    }

    return user;
  }
}
