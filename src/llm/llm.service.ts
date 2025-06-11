import { Solution } from 'src/common/interfaces/solution.interface';

export abstract class LlmService {
  abstract sendImageAndGetAnswer(file: Express.Multer.File): Promise<Solution>;
  abstract validateMathImage(file: Express.Multer.File): Promise<boolean>;
}
