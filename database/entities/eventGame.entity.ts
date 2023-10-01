import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class EventGame extends BaseEntity {
  @Column({ type: 'varchar' })
  eventName: string;

  @Column({ type: 'uuid' })
  createBy: string;

  @Column({ type: 'varchar' })
  nameCreateBy: string;

  @Column({ type: 'int', nullable: true })
  amountPlayer: number;

  @Column({ type: 'int', nullable: true })
  currentUser: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  isComplete: boolean;
}
