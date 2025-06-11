import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { GeminiService } from './gemini/gemini.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LlmService,
      useClass: GeminiService, // 🔁 Swap to AwsS3Service when needed
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
