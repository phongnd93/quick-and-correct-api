import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGroup, UserRole, UserStatus } from 'database/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @MinLength(8, { message: 'Length of password is too short. Minimun length is 8' })
  @MaxLength(20, { message: 'Length of password is too long. Maximun length is 20' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message: 'Password too weak',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsEnum(UserGroup)
  belongGroup: UserGroup;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  viewGroups: UserGroup[];
}
