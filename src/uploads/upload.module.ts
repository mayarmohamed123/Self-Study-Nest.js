import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './images',
        filename: (_req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UploadController],
})
export class UploadsModule {}
