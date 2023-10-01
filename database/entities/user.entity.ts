import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserGroup, UserRole, UserStatus } from '../enums';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: false })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  registerOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  registerOtpExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  forgotPasswordOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  forgotPasswordOtpExpiresAt: Date | null;

  @Column({ enum: UserRole, type: 'enum', default: UserRole.USER })
  role: UserRole;

  @Column({ enum: UserGroup, type: 'enum', nullable: true })
  belongGroup: UserGroup;

  @Column({ type: 'varchar', nullable: true })
  userNameLogin: string | null;

  @Column({ enum: UserGroup, type: 'enum', array: true, default: [] })
  viewGroups: UserGroup[];
}
