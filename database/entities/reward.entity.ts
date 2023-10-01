import { Column, Entity } from 'typeorm';
import { EventType } from 'database/enums/event-type';
import { BaseEntity } from './base.entity';

@Entity()
export class Reward extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  reward: string;

  @Column({ type: 'varchar', nullable: true })
  iapPackage: string;

  @Column({ enum: EventType, type: 'enum', nullable: true })
  eventType: EventType;
}
