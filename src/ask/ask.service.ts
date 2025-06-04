import { Injectable } from '@nestjs/common';
import { GeminiService } from './providers/gemini.service';

@Injectable()
export class AskService {
  constructor(private readonly geminiService: GeminiService) {}

  async processImageQuestion(questionPhoto: Express.Multer.File) {
    return await this.geminiService.sendImageAndGetAnswer(questionPhoto);
  }
}
