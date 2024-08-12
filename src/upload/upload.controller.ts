import {
  Controller,
  InternalServerErrorException,
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
    try {
      const imageUrl: string[] = [];
      await Promise.all(
        files.map(async (file: any) => {
          const key = await this.uploadService.uploadImage(file);
          imageUrl.push(process.env.AWS_BUCKET_ADDRESS + key);
        }),
      );

      return { result: 'SUCCESS', data: imageUrl };
    } catch (error) {
      console.log('🚀 ~ UploadController ~ uploadImages ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    try {
      const key = await this.uploadService.uploadImage(file);
      const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;
      return {
        result: 'SUCCESS',
        data: imageUrl,
      };
    } catch (error) {
      console.log('🚀 ~ UploadController ~ uploadFile ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }
}
