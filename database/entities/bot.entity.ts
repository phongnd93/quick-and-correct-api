import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Bot extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  categoryId: string;

  @Column({ type: 'int' })
  star: number;

  @Column({ type: 'varchar', nullable: true })
  roomId: string;

  @Column({ type: 'varchar' })
  userGamepInfoId: string;
}
