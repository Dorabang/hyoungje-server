import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentsService } from 'src/comments/comments.service';
import { CommentsController } from 'src/comments/comments.controller';
import { Comment } from 'src/comments/entity/comments.entity';
import { Post } from 'src/post/entity/post.entity';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Post])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
