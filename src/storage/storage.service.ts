export abstract class StorageService {
  abstract uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; id?: string }>;
  abstract deleteImage(id: string): Promise<void>;
}
