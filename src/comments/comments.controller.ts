// src/comments/comments.controller.ts

import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from 'src/comments/entity/comments.entity';
import { CreateCommentDto } from './dto/createComments.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body('userId') userId: number,
    @Body('content') content: string,
    @Body('postId') postId: number,
  ): Promise<CreateCommentDto> {
    return this.commentsService.createComment(userId, content, postId);
  }

  @Get(':postId')
  async getCommentsByPost(@Param('postId') postId: number): Promise<Comment[]> {
    return this.commentsService.getCommentsByPost(postId);
  }

  @Delete()
  async deleteComment(@Body('id') id: number): Promise<void> {
    this.commentsService.remove(id);
  }
}
