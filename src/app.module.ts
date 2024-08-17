import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/entity/user.entity';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { Post } from './post/entity/post.entity';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/entity/comments.entity';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Post, Comment],
      autoLoadModels: true,
      synchronize: true,
      logging: true,
    }),
    UserModule,
    PostModule,
    AuthModule,
    CommentsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
