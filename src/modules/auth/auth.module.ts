import { forwardRef, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from 'src/config';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtRegisterStrategy,
  JwtResetPasswordStrategy,
  JwtStrategy,
  LocalStrategy,
} from './strategies';
import { PasswordController } from './password/password.controller';
import { PasswordService } from './password/password.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/register.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [AuthConfig.KEY],
      useFactory: (authConfig: ConfigType<typeof AuthConfig>) => {
        const { jwtSecret, accessTokenExpiration } = authConfig;
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: accessTokenExpiration,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, RegisterController, PasswordController],
  providers: [
    AuthService,
    JwtResetPasswordStrategy,
    LocalStrategy,
    JwtStrategy,
    JwtRegisterStrategy,
    PasswordService,
    RegisterService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
