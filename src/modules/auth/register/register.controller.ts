import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { RegisterService } from './register.service';
import { RegisterDto, VerifyRegisterDto } from '../dtos';

@Controller('auth/register')
@ApiTags('Auth')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    @Inject(AppConfig.KEY)
    private readonly authConfig: ConfigType<typeof AppConfig>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async register(@Body() data: RegisterDto): Promise<any> {
    await this.registerService.register(data);
  }

  @Post('/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify email to finish register' })
  @ApiBody({ type: VerifyRegisterDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async veriry(@Body() { otp, email }: VerifyRegisterDto): Promise<any> {
    await this.registerService.verify(email, otp);
  }
}
