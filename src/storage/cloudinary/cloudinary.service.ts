import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';

@Injectable()
export class CloudinaryService extends StorageService {
  constructor(private configService: ConfigService) {
    super();
    cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; id?: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'User Questions' },
        (error, result) => {
          if (error || !result) {
            return reject(new Error(error?.message || 'Upload failed'));
          }
          resolve({ url: result.secure_url, id: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
