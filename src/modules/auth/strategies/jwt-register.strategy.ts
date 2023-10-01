import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { D2MUnauthorizedException } from 'src/common/infra-exception';
import { AuthConfig } from 'src/config';
import { IJwtEmailPayload } from '../dtos';

@Injectable()
export class JwtRegisterStrategy extends PassportStrategy(Strategy, 'jwt-register') {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const accessToken = request?.cookies?.auth_cookie ?? request?.headers?.auth_cookie;
          if (!accessToken) {
            return null;
          }
          return accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate(payload: IJwtEmailPayload): Promise<any> {
    const { email } = payload;
    if (!email) {
      throw new D2MUnauthorizedException('Unauthorized');
    }
    return { email };
  }
}
