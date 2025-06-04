import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AskService } from './ask.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ask')
export class AskController {
  constructor(private readonly askService: AskService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async askQuestion(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new HttpException('Image file is required', HttpStatus.FORBIDDEN);
    }
    return await this.askService.processImageQuestion(image);
  }
}
