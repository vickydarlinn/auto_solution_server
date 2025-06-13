import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column()
  code: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  purpose: 'register' | 'reset';
}
