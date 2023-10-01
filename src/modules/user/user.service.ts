import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'database/entities';
import { plainToInstance } from 'class-transformer';
import { UserRole, UserStatus } from 'database/enums';
import { D2MBadRequestException, D2MNotFoundException } from 'src/common/infra-exception';
import { BaseService } from 'src/common/services';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/common/dtos';
import { CreateUserDto, ProfileResponseDto, UpdateUserDto } from './dtos';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {
    super(userRepository);
  }

  async getUserProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
      relations: {},
    });

    if (!user) {
      throw new D2MNotFoundException('User not found');
    }

    return plainToInstance(ProfileResponseDto, {
      ...user,
    });
  }

  async findByIdOrFail(id: string): Promise<User> {
    return this.userRepository.findOneByOrFail({ id });
  }

  async findByEmailAndGetPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'password', 'email', 'name', 'status', 'role', 'viewGroups', 'belongGroup'],
    });
  }

  async userAdmin(): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder(this.getModelName());
    queryBuilder.where('User.role != :role', { role: UserRole.USER });
    return queryBuilder.getMany();
  }

  async users(
    pageOptionsDto: PageOptionsDto,
    rawQuery?: { where: string; parameters?: ObjectLiteral },
  ): Promise<PageDto<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder(this.getModelName());
    if (rawQuery) {
      queryBuilder.where(rawQuery.where, rawQuery?.parameters);
    }
    const { q } = pageOptionsDto;
    if (q) {
      queryBuilder.andWhere('User.name like :name OR User.email like :email', {
        name: `%${q}%`,
        email: `%${q}%`,
      });
    }
    queryBuilder
      .orderBy(pageOptionsDto.sort || 'created_at', pageOptionsDto.sortDirection || 'DESC')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    if (await this.findOne({ email: data.email })) {
      throw new D2MBadRequestException('Email address is already in use');
    }
    const user = await this.create(data);
    if (!user) {
      throw new D2MBadRequestException('Failed, cant update user');
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.update(id, data);
    if (!user) {
      throw new D2MBadRequestException('Failed, cant update user');
    }
    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id }, select: ['id'] });
    if (!user) {
      throw new D2MNotFoundException('User not found');
    }
    await this.userRepository.update(id, { status });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id }, select: ['id'] });
    if (!user) {
      throw new D2MNotFoundException('User not found');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(id, { password: hashPassword });
  }

  async deleteUserByAdmin(id: string): Promise<void> {
    const user = await this.findByIdOrFail(id);
    if (user.role === UserRole.ADMIN) {
      throw new D2MBadRequestException('Cant delete user admin');
    }
    const result = await this.userRepository.update(
      { id: user.id },
      { status: UserStatus.BLOCKED },
    );
    if (result.affected === 0) {
      throw new D2MNotFoundException(`Can not delete, user does not exist`);
    }
  }

  async deleteUser(user: User, password: string): Promise<void> {
    const validatedUser = await this.authService.validateUser(user.email, password);
    if (!validatedUser) {
      throw new D2MBadRequestException('Wrong password');
    }
    const result = await this.userRepository.update(
      { id: user.id },
      { status: UserStatus.BLOCKED },
    );
    if (result.affected === 0) {
      throw new D2MNotFoundException(`Can not delete, user does not exist`);
    }
  }
}
