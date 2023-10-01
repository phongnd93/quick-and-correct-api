import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class UserGameInfo extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  userName: string;

  @Column({ type: 'int' })
  scoreDay: number | 0;

  @Column({ type: 'int' })
  scoreWeek: number | 0;

  @Column({ type: 'int' })
  scoreMonth: number | 0;

  @Column({ type: 'int' })
  ruby: number | 0;

  @Column({ type: 'int' })
  scoreComboStreakMonth: number | 0;

  @Column({ type: 'int' })
  scoreComboStreakDay: number | 0;

  @Column({ type: 'int' })
  scoreComboStreakWeek: number | 0;

  @Column({ type: 'real' })
  timeAnswerMonth: number | 0;

  @Column({ type: 'real' })
  timeAnswerDay: number | 0;

  @Column({ type: 'real' })
  timeAnswerWeek: number | 0;

  @Column({ type: 'real', nullable: true, default: 0 })
  currentTimeStreak: number | 0;

  @Column({ type: 'real', nullable: true, default: 0 })
  timeAnswerStreakMonth: number | 0;

  @Column({ type: 'real', nullable: true, default: 0 })
  timeAnswerStreakDay: number | 0;

  @Column({ type: 'real', nullable: true, default: 0 })
  timeAnswerStreakWeek: number | 0;

  @Column({ type: 'int' })
  amountHelp50: number | 0;

  @Column({ type: 'int' })
  amountSaveLife: number | 0;

  @Column({ type: 'int', nullable: true })
  amountHelp50Used: number | 0;

  @Column({ type: 'int', nullable: true })
  amountSaveLifeUsed: number | 0;

  @Column({ type: 'bool', default: true })
  isDailyReward: boolean | true;

  @Column({ type: 'varchar', nullable: true, default: null })
  packageDaily: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  ambassadorLevel: number | 0;

  @Column({ type: 'int', nullable: true, default: 0 })
  correctAnswer: number | 0;

  @Column({ type: 'int', nullable: true, default: 0 })
  errorAnswer: number | 0;

  @Column({ type: 'int', nullable: true, default: 0 })
  eventPlayTime: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  eventCreateTime: number;

  @Column({ type: 'timestamp', nullable: true })
  eventEndTime: Date;

  @Column({ type: 'uuid', nullable: true })
  eventId: string;

  @Column({ type: 'varchar', nullable: true })
  eventName: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;
}
