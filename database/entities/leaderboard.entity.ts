import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Leaderboard extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  playerName: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'varchar', nullable: true })
  country: string;
}
