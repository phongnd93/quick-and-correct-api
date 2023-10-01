import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class ConfigGame extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  tag: string;

  @Column({ type: 'varchar' })
  config: string;
}
