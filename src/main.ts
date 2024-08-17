import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.NODE_ENV) {
    console.error('NODE_ENV is not set. Defaulting to "production".');
    process.env.NODE_ENV = 'production';
  }
  const originUrl = [process.env.FRONT_URL];
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.enableCors({
    origin: originUrl,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(5000);
}
bootstrap();
