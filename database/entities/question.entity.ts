import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { QuestionType } from 'database/enums/question-type';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Question extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  categoryId: string;

  @Column({ enum: QuestionType, type: 'enum', default: QuestionType.TEXT })
  questionType: QuestionType;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  answerA: string;

  @Column({ type: 'varchar' })
  answerB: string;

  @Column({ type: 'varchar', nullable: true })
  answerC: string | null;

  @Column({ type: 'varchar', nullable: true })
  answerD: string | null;

  @Column({ type: 'int' })
  star: number | 1;

  @Column({ type: 'varchar' })
  result: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  userCreated: User;

  @Column({ type: 'bool', nullable: true })
  approved: boolean | null;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  userApprove: User;

  @Column({ type: 'timestamp', nullable: true })
  approveDate: Date | null;

  @Column({ type: 'bool', default: true })
  active: boolean;
}
