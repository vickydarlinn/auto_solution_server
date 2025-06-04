import { Module } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskController } from './ask.controller';
import { GeminiService } from './providers/gemini.service';

@Module({
  controllers: [AskController],
  providers: [AskService, GeminiService],
})
export class AskModule {}
