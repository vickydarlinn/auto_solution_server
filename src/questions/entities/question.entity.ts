import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuestionStatus } from '../enums/question-status.enum';

import { Solution } from '../../common/interfaces/solution.interface';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageUrl: string; // Path to uploaded image

  @Column({ type: 'jsonb', nullable: true })
  solution: Solution; // AI-generated solution

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.PENDING,
  })
  status: QuestionStatus;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  difficulty: string;

  @ManyToOne(() => User, (user) => user.questions, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
