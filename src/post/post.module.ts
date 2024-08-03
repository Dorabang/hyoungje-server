import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entity/post.entity';
import { Comment } from 'src/comments/entity/comments.entity';

@Module({
  imports: [SequelizeModule.forFeature([Post, Comment])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
