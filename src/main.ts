import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const originUrl = [process.env.PRODUCT_FRONT_URL, process.env.DEV_FRONT_URL];
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '15mb' }));
  app.enableCors({
    origin: originUrl,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(5000);
}
bootstrap();
