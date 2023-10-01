import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { User } from 'database/entities';
import { UserStatus } from 'database/enums';
import {
  D2MBadRequestException,
  D2MNotFoundException,
  D2MUnauthorizedException,
} from 'src/common/infra-exception';
import { AuthToken } from 'src/common/types';
import { generateOtp } from 'src/common/utils';
import { AppConfig } from 'src/config';
import { MailService } from 'src/modules/mail/mail.service';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { MoreThanOrEqual } from 'typeorm';
import { AuthService } from '../auth.service';
import { ResetPasswordDto } from '../dtos';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class PasswordService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOne({ email, status: UserStatus.ACTIVE });
    if (!user) {
      throw new D2MNotFoundException('Email address could not be found');
    }
    if (user.forgotPasswordOtpExpiresAt && user.forgotPasswordOtpExpiresAt > new Date()) {
      throw new D2MBadRequestException('Forgot password otp has already been sent');
    } else {
      user.forgotPasswordOtp = generateOtp();
      user.forgotPasswordOtpExpiresAt = new Date(Date.now() + this.appConfig.otpTimeout);
      await this.userService.update(user.id, user);
    }
    this.mailService.sendUserForgotPassword(user, user.forgotPasswordOtp as string);
  }

  async verifyForgotPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, otp, password } = resetPasswordDto;
    const user = await this.userService.findOne({
      email,
      forgotPasswordOtp: otp,
      forgotPasswordOtpExpiresAt: MoreThanOrEqual(new Date()),
    });
    if (!user) {
      throw new D2MNotFoundException('Invalid or expired confirmation code');
    }
    const { id: userId, forgotPasswordOtp } = user;
    if (otp !== forgotPasswordOtp) {
      throw new D2MBadRequestException('Invalid OTP, please try again');
    }

    await this.userService.update(userId, {
      password: await bcrypt.hash(password, 10),
      forgotPasswordOtp: null,
      forgotPasswordOtpExpiresAt: null,
    });
  }

  async changePassword(
    user: User,
    { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<AuthToken> {
    const { email, id } = user;
    const usr = await this.authService.validateUser(email, oldPassword);
    if (!usr) throw new D2MUnauthorizedException('Password invalid, please try again');
    await this.userService.updatePassword(id, newPassword);
    return this.authService.generateToken(user.id);
  }
}
