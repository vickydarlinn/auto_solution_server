import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageService,
      useClass: CloudinaryService, // 🔁 Swap to AwsS3Service when needed
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
