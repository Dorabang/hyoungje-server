import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files) {
    const imageURL: string[] = [];
    await Promise.all(
      files.map(async (file: any) => {
        const key = await this.uploadService.uploadImage(file);
        imageURL.push(process.env.AWS_BUCKET_ADDRESS + key);
      }),
    );

    return { message: 'successfully uploaded', data: imageURL };
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    const key = await this.uploadService.uploadImage(file);
    const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;

    return {
      message: `이미지 등록 성공`,
      data: imageUrl,
    };
  }
}
