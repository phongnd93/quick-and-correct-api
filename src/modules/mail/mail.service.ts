/* eslint-disable import/no-extraneous-dependencies */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'database/entities';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserForgotPassword(user: User, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset password email',
      template: './forgot-password',
      context: {
        name: user.name,
        otp,
      },
    });
  }

  async sendUserRegister(user: User, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to D2M App! Confirm email for registration',
      template: './confirm',
      context: {
        name: user.name,
        otp,
      },
    });
  }
}
