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
  Put,
  InternalServerErrorException,
  Query,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { Comment } from 'src/comments/entity/comments.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @UseGuards(AuthGuard)
  @Get('myComments')
  async getMyComments(@Req() req: Request, @Res() res: Response) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    const myComments = await this.commentsService.getMyComments(user.id);

    return res.status(200).json({ result: 'SUCCESS', data: myComments });
  }

  @Get(':postId')
  async getCommentsByPost(
    @Param('postId') postId: number,
    @Query('page') page: number = 1,
    @Query('size') size: number = 15,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    result: 'SUCCESS';
    data: Comment[];
    totalResult: number;
    currentPage: number;
    totalPages: number;
    isLast: boolean;
  }> {
    return this.commentsService.getCommentsByPost(
      postId,
      page,
      size,
      sort,
      order,
    );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateComment(
    @Param('id') id: number,
    @Body('content') content: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    /* 사용자 권한 확인 */
    await this.userService.getByUserId(payload.userId);

    const comment = await this.commentsService.findOne(id);
    if (!payload.isAdmin && comment.userId !== payload.sub) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }
    if (!comment) {
      throw new NotFoundException({
        result: 'ERROR',
        message: `Comment ${id} not found`,
      });
    }
    try {
      this.commentsService.update(id, { content });
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ CommentsController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteComment(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    /* 사용자 권한 확인 */
    await this.userService.getByUserId(payload.userId);

    const comment = await this.commentsService.findOne(id);
    if (!payload.isAdmin && comment.userId !== payload.sub) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }
    if (!comment) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Comment not found',
      });
    }

    try {
      this.commentsService.remove(id);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ CommentsController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }
}
