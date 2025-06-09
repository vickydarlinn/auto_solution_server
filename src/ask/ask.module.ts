import { Module } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskController } from './ask.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ask } from './entities/ask.entity';
import { GeminiService } from './providers/gemini.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ask])],
  controllers: [AskController],
  providers: [AskService, GeminiService],
  exports: [TypeOrmModule],
})
export class AskModule {}
