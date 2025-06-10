import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async findAll(userId: string) {
    return this.questionRepository.find({ where: { userId } });
  }

  async findOne({
    questionId,
    userId,
  }: {
    questionId: string;
    userId: string;
  }) {
    return this.questionRepository.findOne({
      where: {
        id: questionId,
        userId,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
