import { Controller, Get, Param, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Request } from 'express';
import { REQUEST_USER_KEY } from 'src/common/constants';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req[REQUEST_USER_KEY] as JwtPayload;
    return this.questionsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req[REQUEST_USER_KEY] as JwtPayload;

    return this.questionsService.findOne({
      questionId: id,
      userId: user.sub,
    });
  }
}
