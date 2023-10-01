import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRole } from 'database/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
