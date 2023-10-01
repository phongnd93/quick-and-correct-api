import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from 'database/entities';
import { UserStatus } from 'database/enums';
import { AuthConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { AuthToken } from 'src/common/types';
import {
  D2MBadRequestException,
  D2MNotFoundException,
  D2MUnauthorizedException,
} from 'src/common/infra-exception';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { IAccessToken, IJwtPayload, LoginResponseDto, RegisterNonVerifyDto } from './dtos';
import { LoginFacebookDto } from './dtos/loginFacebook.dto';
import { RegisterResponse } from './dtos/registerResponse.dto';
import { LoginUserNameDTO } from './dtos/loginUserName.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(AuthConfig.KEY)
    private readonly authConfig: ConfigType<typeof AuthConfig>,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmailAndGetPassword(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new D2MUnauthorizedException('Unauthorized');
    }

    const { status } = user;
    if (status !== UserStatus.ACTIVE) {
      throw new D2MUnauthorizedException('Your account was inactive or blocked');
    }

    return user;
  }

  async loginByFaceBook(loginFacebook: LoginFacebookDto): Promise<LoginResponseDto> {
    const user = await this.userService.findOne({ email: loginFacebook.facebookId });
    if (user) {
      const { password, ...rest } = user;
      const { id } = rest;
      const { accessToken } = await this.generateToken(id);
      return { user: rest, accessToken };
    }

    const newuser = await this.userService.create({
      email: loginFacebook.facebookId,
      name: loginFacebook.userName,
      password: await bcrypt.hash('test', 10),
      status: UserStatus.ACTIVE,
    });

    const { password, ...rest } = newuser;
    const { id } = rest;
    const { accessToken } = await this.generateToken(id);
    return { user: rest, accessToken };
  }

  async loginByUserName(loginUserName: LoginUserNameDTO): Promise<LoginResponseDto> {
    const user = await this.userService.findOne({ userNameLogin: loginUserName.userNameLogin });
    if (user) {
      const { password, ...rest } = user;
      const { id } = rest;
      const { accessToken } = await this.generateToken(id);
      return { user: rest, accessToken };
    }
    throw new D2MBadRequestException('Sai tên đăng nhập hoặc mật khẩu!');
  }

  async registerNonVerify(registerDto: RegisterNonVerifyDto): Promise<RegisterResponse> {
    if (registerDto.userNameLogin.length < 6 && registerDto.userNameLogin.length > 20) {
      return {
        isComplete: false,
        message: 'Tên đăng nhập số lượng kí tự nhiều lớn hơn 6 và ít hơn!',
      };
    }
    const userByUsername = await this.userService.findOne({
      userNameLogin: registerDto.userNameLogin,
    });
    if (userByUsername) {
      return { isComplete: false, message: 'Tên đăng nhập đã được sử dụng!' };
    }

    if (registerDto.name.length < 6 && registerDto.name.length > 20) {
      return {
        isComplete: false,
        message: 'Tên người dùng số lượng kí tự nhiều lớn hơn 6 và ít hơn!',
      };
    }

    if (registerDto.password.length < 6 && registerDto.password.length > 20) {
      return {
        isComplete: false,
        message: 'Mật khẩu số lượng kí tự phải nhiều hơn 6 và ít hơn 20!',
      };
    }

    if (registerDto.email.length > 6) {
      const user = await this.userService.findOne({ email: registerDto.email });
      if (user) {
        return { isComplete: false, message: 'Email đã được sử dụng!' };
      }
    }

    await this.userService.create({
      email: registerDto.email,
      name: registerDto.name,
      userNameLogin: registerDto.userNameLogin,
      password: await bcrypt.hash(registerDto.password, 10),
      status: UserStatus.ACTIVE,
    });
    return { isComplete: true, message: 'Đăng kí thành công!' };
  }

  async login(user: User): Promise<LoginResponseDto> {
    const { password, ...rest } = user;
    const { status, id } = rest;
    if (status === UserStatus.BLOCKED) {
      throw new D2MBadRequestException(
        'User was deactivated for removal and can not be authenticated',
      );
    } else if (status === UserStatus.INACTIVE) {
      throw new D2MUnauthorizedException('Your account was inactive');
    }
    const { accessToken } = await this.generateToken(id);
    return { user: rest, accessToken };
  }

  async generateToken(userId: string): Promise<AuthToken> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new D2MNotFoundException('User not found');
    }

    const { accessToken } = this.generateAccessToken({ id: userId, email: user.email });

    return { accessToken };
  }

  private generateAccessToken(payload: IJwtPayload): IAccessToken {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
