import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { AppConfig } from 'src/config';
import { AuthToken } from 'src/common/types';
import { D2MBadRequestException, D2MNotFoundException } from 'src/common/infra-exception';
import { UserStatus } from 'database/enums';
import { MoreThanOrEqual } from 'typeorm';
import { generateOtp } from 'src/common/utils';
import { MailService } from 'src/modules/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dtos';
import { AuthService } from '../auth.service';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async register(data: RegisterDto): Promise<void> {
    const { email, password } = data;

    let user = await this.userService.findOne({ email });
    if (user) {
      if (user.status === UserStatus.ACTIVE || user.status === UserStatus.BLOCKED) {
        throw new D2MBadRequestException('Email address is already in use');
      } else if (user.registerOtpExpiresAt && user.registerOtpExpiresAt > new Date()) {
        throw new D2MBadRequestException('Register otp has already been sent');
      } else {
        user.registerOtp = generateOtp();
        user.registerOtpExpiresAt = new Date(Date.now() + this.appConfig.otpTimeout);
        await this.userService.update(user.id, user);
      }
    } else {
      user = await this.userService.create({
        ...data,
        password: await bcrypt.hash(password, 10),
        registerOtp: generateOtp(),
        registerOtpExpiresAt: new Date(Date.now() + this.appConfig.otpTimeout),
      });
    }
    this.mailService.sendUserRegister(user, user.registerOtp as string);
  }

  async verify(email: string, registerOtp: string): Promise<AuthToken> {
    const user = await this.userService.findOne({
      registerOtp,
      email,
      registerOtpExpiresAt: MoreThanOrEqual(new Date()),
    });
    if (!user) {
      throw new D2MNotFoundException('Verification token is invalid or has expired');
    }

    const { id, status } = user;

    if (status === UserStatus.ACTIVE) {
      throw new D2MBadRequestException('Email address has already been verified');
    }
    if (status === UserStatus.BLOCKED) {
      throw new D2MBadRequestException('Email address has blocked');
    }
    await this.userService.update(id, {
      registerOtp: null,
      registerOtpExpiresAt: null,
      status: UserStatus.ACTIVE,
    });
    // this.eventEmitter.emit(Event.USER_FIRST_LOGIN, new UserAuthEvent(user, device));
    return this.authService.generateToken(id);
  }
}
