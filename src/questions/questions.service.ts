import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { LlmService } from 'src/llm/llm.service';
import { StorageService } from 'src/storage/storage.service';
import { QuestionStatus } from './enums/question-status.enum';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly llmService: LlmService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(userId: string) {
    return this.questionRepository.find({ where: { user: { id: userId } } });
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
        user: { id: userId },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }

  async askQuestion({
    userId,
    questionImage,
  }: {
    userId: string;
    questionImage: Express.Multer.File;
  }) {
    // 1. Upload image to Cloudinary / S3
    const { url: imageUrl } =
      await this.storageService.uploadImage(questionImage);

    // 2. Send image to LLM (Gemini, OpenAI) and get answer
    const solution = await this.llmService.sendImageAndGetAnswer(questionImage);

    const newQuestion = {
      user: { id: userId },
      imageUrl,
      solution,
      status: QuestionStatus.SOLVED,
    };

    await this.questionRepository.save(newQuestion);

    return newQuestion;
  }
}
