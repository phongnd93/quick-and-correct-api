import { Exclude, Expose } from 'class-transformer';
import { UserRole } from 'database/enums';

@Exclude()
export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: UserRole;
}
