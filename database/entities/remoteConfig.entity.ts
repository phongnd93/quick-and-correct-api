import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class RemoteConfig extends BaseEntity {
  @Column({ type: 'varchar' })
  version: string;

  @Column({ type: 'varchar' })
  os: string;

  @Column({ type: 'bool', nullable: true })
  isAutoLogin: boolean | true;

  @Column({ type: 'varchar', default: 'vietnguyen0907@gmail.com' })
  account: string | null;

  @Column({ type: 'varchar', default: 'Password12#' })
  password: string | null;
}
