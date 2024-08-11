import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entity/post.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createPostDto: Partial<PostEntity>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: any = req.user;
    const validateUser = this.userService.getByUserId(user.userId);

    if (validateUser) {
      const data = await this.postService.create({
        views: 0,
        userId: user.sub,
        ...createPostDto,
      });

      return res.status(201).json({ result: 'SUCCESS', data });
    }
    throw new UnauthorizedException({ result: 'ERROR' });
  }

  @Get()
  async findAll(
    @Query('marketType') marketType: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    result: 'SUCCESS' | 'ERROR';
    data: PostEntity[];
    totalResult: number;
    currentPage: number;
    totalPages: number;
    isLast: boolean;
  }> {
    return await this.postService.findAll(marketType, page, size, sort, order);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const post = await this.postService.findOne(id);
    if (!post) {
      return res
        .status(404)
        .json({ message: '해당 게시물을 찾을 수 없습니다.' });
    }
    return res.status(200).json({ result: 'SUCCESS', data: post });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: Partial<PostEntity>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    const post = await this.postService.findOne(id);

    if (!payload.isAdmin && user.id !== post.userId) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }

    try {
      this.postService.update(id, updatePostDto);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ PostController ~ error:', error);
      return res
        .status(404)
        .json({ result: 'ERROR', message: '해당 게시물을 찾을 수 없습니다.' });
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    const post = await this.postService.findOne(id);
    if (!post) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Post not found',
      });
    }
    if (!payload.isAdmin && user.id !== post.userId) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }
    this.postService.remove(id);

    return res.status(200).json({ result: 'SUCCESS' });
  }
}
