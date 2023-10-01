import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class UserEventGame extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  userGameId: string;

  @Column({ type: 'varchar' })
  userGameName: string;

  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'int' })
  score: number | 0;

  @Column({ type: 'real' })
  timeAnswer: number | 0;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  ambassadorLevel: number | 0;
}
