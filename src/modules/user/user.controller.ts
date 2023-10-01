import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'database/entities';
import { UserRole } from 'database/enums';
import * as bcrypt from 'bcrypt';
import { FindOneParams } from 'database/dtos';
import { PageDto, PageOptionsDto } from 'src/common/dtos';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto, UserDto } from './dtos';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { ProfileResponseDto } from './dtos/get-profile.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user info' })
  @ApiOkResponse({ status: HttpStatus.OK, type: ProfileResponseDto })
  me(@CurrentUser() user: User): Promise<ProfileResponseDto> {
    return this.userService.getUserProfile(user.id);
  }

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user admin list' })
  @ApiBearerAuth('access-token')
  @Get('/admin')
  async userAdmin(): Promise<User[]> {
    return this.userService.userAdmin();
  }

  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200 })
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user detail' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async user(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @ApiResponse({ type: PageDto<UserDto>, status: 200 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user list' })
  @ApiBearerAuth('access-token')
  @Get('')
  async users(@Query() pageOptions: PageOptionsDto): Promise<PageDto<User>> {
    return this.userService.users(pageOptions);
  }

  @Post('')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user' })
  @ApiNoContentResponse()
  @ApiBody({ type: UpdateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // eslint-disable-next-line no-param-reassign
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    return this.userService.createUser(createUserDto);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update user' })
  @Roles(UserRole.ADMIN)
  @ApiNoContentResponse()
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param() { id }: FindOneParams,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (updateUserDto.password) {
      // eslint-disable-next-line no-param-reassign
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  // For Admin delete user
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'For Admin delete user' })
  @ApiBearerAuth('access-token')
  @ApiNoContentResponse()
  deleteUserByAdmin(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUserByAdmin(id);
  }

  // Self user delete
  @Delete('')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Self user delete' })
  @ApiNoContentResponse()
  @ApiBody({ type: DeleteUserDto })
  delete(@CurrentUser() user: User, @Body() { password }: DeleteUserDto): Promise<void> {
    return this.userService.deleteUser(user, password);
  }
}
