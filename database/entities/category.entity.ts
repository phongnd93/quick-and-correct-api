import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Category extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  priority: number;

  @Column({ type: 'int', nullable: true })
  numlimit: number | null;

  @Column({ type: 'bool', nullable: true })
  active: boolean | true;
}
