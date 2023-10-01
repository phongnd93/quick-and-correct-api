import { Controller, Post, Body, HttpCode, UseGuards, HttpStatus, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { User } from 'database/entities';
import { AuthToken } from 'src/common/types';
import { PasswordService } from './password.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dtos';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators';

@Controller('auth')
@ApiTags('Auth')
export class PasswordController {
  constructor(
    private readonly resetPasswordService: PasswordService,
    @Inject(AppConfig.KEY)
    private readonly authConfig: ConfigType<typeof AppConfig>,
  ) {}

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request forgot password' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<void> {
    return this.resetPasswordService.forgotPassword(email);
  }

  @Post('forgot-password/verify')
  @ApiOperation({ summary: 'Input OTP for reset new password' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.resetPasswordService.verifyForgotPassword(resetPasswordDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change new password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: HttpStatus.OK })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<AuthToken> {
    return this.resetPasswordService.changePassword(user, changePasswordDto);
  }
}
