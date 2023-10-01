import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from 'src/config';
import { D2MUnauthorizedException } from 'src/common/infra-exception';
import { AuthService } from '../auth.service';
import { IJwtPayload } from '../dtos';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: IJwtPayload): Promise<any> {
    if (!payload) {
      throw new D2MUnauthorizedException('Unauthorized');
    }

    const { id: userId } = payload;
    const user = await this.authService.validateUserById(userId);

    return user;
  }
}
