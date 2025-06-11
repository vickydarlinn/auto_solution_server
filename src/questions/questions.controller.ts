import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Request } from 'express';
import { REQUEST_USER_KEY } from 'src/common/constants';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('ask')
  @UseInterceptors(FileInterceptor('image'))
  askQuestion(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new HttpException('Image file is required', HttpStatus.FORBIDDEN);
    }
    const user = req[REQUEST_USER_KEY] as JwtPayload;
    return this.questionsService.askQuestion({
      userId: user.sub,
      questionImage: image,
    });
  }
}
