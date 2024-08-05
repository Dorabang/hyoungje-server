import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from 'src/comments/entity/comments.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post(':postId')
  async createComment(
    @Param('postId') postId: number,
    @Body('content') content: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException({
        error: 'E001',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }
    const comment = await this.commentsService.createComment(
      user.id,
      content,
      postId,
    );

    return res.status(201).json({
      result: 'SUCCESS',
      data: comment,
    });
  }

  @Get(':postId')
  async getCommentsByPost(@Param('postId') postId: number): Promise<Comment[]> {
    return this.commentsService.getCommentsByPost(postId);
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: number,
    @Body('content') content: string,
  ) {
    this.commentsService.update(id, { content });
  }

  @Delete()
  async deleteComment(@Body('id') id: number, @Res() res: Response) {
    this.commentsService.remove(id);

    return res.status(200).json({ result: 'SUCCESS' });
  }
}
