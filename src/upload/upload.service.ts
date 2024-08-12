import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly s3: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.s3 = new AWS.S3();
  }

  async uploadImage(file: any): Promise<string> {
    const optimizedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 90 })
      .toBuffer();

    const [fileName, ..._rest] = file.originalname.split('.');

    const key = `images/${Date.now()}${fileName}.jpg`;
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: 'private',
      Key: key,
      Body: optimizedBuffer,
    };

    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err: Error) => {
        if (err) reject(err);
        resolve(key);
      });
    });
  }
}
