import {
  Controller,
  Post,
  Delete,
  UseGuards,
  Req,
  Res,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BookmarksService } from './bookmark.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(AuthGuard)
  @Post(':postId')
  async createBookmark(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: number,
  ) {
    const user: any = req.user;

    try {
      await this.bookmarksService.createBookmark(user.sub, postId);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ BookmarksController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async getBookmarkByUser(@Req() req: Request, @Res() res: Response) {
    const user: any = req.user;
    const bookmark = await this.bookmarksService.getBookmarksByUser(user.sub);

    return res.status(200).json({ result: 'SUCCESS', data: bookmark });
  }

  @UseGuards(AuthGuard)
  @Get(':postId')
  async getBookmarkByPost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: number,
  ) {
    const user: any = req.user;
    const bookmark = await this.bookmarksService.getBookmarksByPost(postId);

    return res.status(200).json({
      result: 'SUCCESS',
      data: bookmark,
      ...(user && { isBookmarked: bookmark.includes(user.sub) }),
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':postId')
  async removeBookmark(
    @Req() req: Request,
    @Res() res: Response,
    @Param('postId') postId: number,
  ) {
    const user: any = req.user;

    try {
      await this.bookmarksService.removeBookmark(user.sub, postId);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ BookmarksController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }
}
