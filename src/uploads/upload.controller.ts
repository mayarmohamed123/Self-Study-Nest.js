import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/upload')
export class UploadController {
  /**
   * POST api/upload
   * Single file upload. Field name: "file".
   * Multer config is inherited from UploadsModule — no inline storage options needed.
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  /**
   * POST api/upload/multiple
   * Multiple file upload. Field name: "files".
   * All files are stored in ./images using the module-level Multer config.
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  public uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return {
      message: `${files.length} file(s) uploaded successfully`,
      files: files.map((f) => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
      })),
    };
  }
}
