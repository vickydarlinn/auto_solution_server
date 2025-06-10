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
import { Answer } from '../interfaces/answer.interface';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  imageUrl: string; // Path to uploaded image

  @Column({ type: 'jsonb', nullable: true })
  solution: Answer; // AI-generated solution

  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.PENDING,
  })
  status: QuestionStatus;

  @Column({ nullable: true })
  subject: string; // Math, Physics, Chemistry, etc.

  @Column({ nullable: true })
  difficulty: string; // Easy, Medium, Hard

  @ManyToOne(() => User, (user) => user.questions)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
