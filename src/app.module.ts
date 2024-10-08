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
import { DocumentCounterModule } from './documentCounter/documentCounter.module';
import { BookmarksModule } from './bookmarks/bookmark.module';
import { DocumentCounter } from './documentCounter/entity/documentCounter.entity';
import { Bookmark } from './bookmarks/entity/bookmark.entity';
import { EmailModule } from './email/email.module';
import { Channel } from './youtube/entity/channel.entity';
import { Playlist } from './youtube/entity/playlist.entity';
import { YoutubeModule } from './youtube/youtube.module';
import { Email } from './email/entity/email.entity';
import { TransactionService } from './transaction/transaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User,
        Post,
        Comment,
        DocumentCounter,
        Bookmark,
        Email,
        Channel,
        Playlist,
      ],
      autoLoadModels: true,
      synchronize: true,
      logging: true,
    }),
    UserModule,
    PostModule,
    AuthModule,
    CommentsModule,
    UploadModule,
    DocumentCounterModule,
    BookmarksModule,
    EmailModule,
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [AppService, TransactionService],
})
export class AppModule {}
