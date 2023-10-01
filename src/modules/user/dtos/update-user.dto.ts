import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'Password12#', required: true, minLength: 8 })
  @MinLength(8, { message: 'Length of password is too short. Minimun length is 8' })
  @MaxLength(20, { message: 'Length of password is too long. Maximun length is 20' })
  @IsString()
  @IsOptional()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,20}$/, {
    message: 'Password too weak',
  })
  password: string;
}
