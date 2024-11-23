import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entity/post.entity';
import { Comment } from 'src/comments/entity/comments.entity';
import { DocumentCounter } from 'src/documentCounter/entity/documentCounter.entity';
import { Bookmark } from 'src/bookmarks/entity/bookmark.entity';
import { UploadModule } from 'src/upload/upload.module';
import { DocumentCounterModule } from 'src/documentCounter/documentCounter.module';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Post, Comment, DocumentCounter, Bookmark]),
    UploadModule,
    forwardRef(() => DocumentCounterModule),
  ],
  controllers: [PostController],
  providers: [PostService, TransactionService],
  exports: [PostService],
})
export class PostModule {}
