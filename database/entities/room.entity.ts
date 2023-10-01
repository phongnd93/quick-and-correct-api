import { Column, Entity } from 'typeorm';
import { RoomType } from 'database/enums/room-type';
import { BaseEntity } from './base.entity';

@Entity()
export class Room extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  id: string;

  @Column({ type: 'varchar' })
  questionId: string;

  @Column({ type: 'varchar' })
  roomName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  processing: string;

  @Column({ type: 'int' })
  amountPlayer: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  currentPrioty: number;

  @Column({ type: 'int' })
  maxPlayer: number;

  @Column({ type: 'int' })
  amountQuestion: number;

  @Column({ type: 'int' })
  currentQuestion: number;

  @Column({ type: 'int' })
  rubyBet: number;

  @Column({ type: 'int' })
  totalRubyBet: number;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.NORMAL })
  type: RoomType;

  @Column({ type: 'timestamp', nullable: true })
  startQuestionTime: Date | null;

  @Column({ type: 'int' })
  maxQuestion: number;

  @Column({ type: 'varchar', nullable: true })
  nextQuestion: string;
}
