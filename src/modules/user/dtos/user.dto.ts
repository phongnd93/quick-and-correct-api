import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from 'database/enums';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'enum', enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ type: 'enum', enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;
}
