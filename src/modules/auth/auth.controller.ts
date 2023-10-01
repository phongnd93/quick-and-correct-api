import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'database/entities';
import { AppConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, RegisterNonVerifyDto } from './dtos';
import { CurrentUser } from './decorators';
import { LocalAuthGuard } from './guards';
import { LoginFacebookDto } from './dtos/loginFacebook.dto';
import { RegisterResponse } from './dtos/registerResponse.dto';
import { LoginUserNameDTO } from './dtos/loginUserName.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly authConfig: ConfigType<typeof AppConfig>,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and return access token' })
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  async login(@CurrentUser() user: User): Promise<LoginResponseDto> {
    return this.authService.login(user);
  }

  @Post('loginUserName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and return access token' })
  @ApiBody({ type: LoginUserNameDTO })
  @ApiOkResponse({ type: LoginResponseDto })
  async loginUserName(
    @CurrentUser() user: User,
    @Body() body: LoginUserNameDTO,
  ): Promise<LoginResponseDto> {
    return this.authService.loginByUserName(body);
  }

  @Post('loginFacebook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and return access token' })
  @ApiBody({ type: LoginFacebookDto })
  @ApiOkResponse({ type: LoginResponseDto })
  async loginFacebook(@Body() body: LoginFacebookDto): Promise<LoginResponseDto> {
    return this.authService.loginByFaceBook(body);
  }

  @Post('regigterNonVerify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'register' })
  @ApiBody({ type: RegisterNonVerifyDto })
  @ApiOkResponse({ type: RegisterResponse })
  async regigterNonVerify(@Body() body: RegisterNonVerifyDto): Promise<RegisterResponse> {
    return this.authService.registerNonVerify(body);
  }
}
