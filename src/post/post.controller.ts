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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { PostService } from './post.service';
import { Post as PostEntity } from './entity/post.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('image', 8))
  async create(
    @Body() createPostDto: Partial<PostEntity>,
    @UploadedFiles() files,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user: any = req.user;
    const validateUser = this.userService.getByUserId(user.userId);
    const createPost = { ...createPostDto };

    if (files) {
      const imageUrl: string[] = [];
      await Promise.all(
        files.map(async (file: Express.Multer.File) => {
          const key = await this.uploadService.uploadImage(file);
          imageUrl.push(process.env.AWS_BUCKET_ADDRESS + key);
        }),
      );

      createPost['image'] = imageUrl;
    }

    if (validateUser) {
      const data = await this.postService.create({
        userId: user.sub,
        ...createPost,
      });

      return res.status(201).json({ result: 'SUCCESS', data });
    }
    throw new UnauthorizedException({ result: 'ERROR' });
  }

  @Get()
  async findAll(
    @Query('marketType') marketType: string,
    @Query('status') status: 'all' | 'sale' | 'sold-out' | 'reservation',
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
    return await this.postService.findAll(
      marketType,
      status,
      page,
      size,
      sort,
      order,
    );
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
  @UseInterceptors(FilesInterceptor('updateImage', 8))
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: Partial<PostEntity>,
    @UploadedFiles() files,
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
      const updatePost = { ...updatePostDto };

      if (files) {
        const imageUrl: string[] = [];
        await Promise.all(
          files.map(async (file: Express.Multer.File) => {
            const key = await this.uploadService.uploadImage(file);
            imageUrl.push(process.env.AWS_BUCKET_ADDRESS + key);
          }),
        );

        updatePost['image'] = [...updatePostDto.image, ...imageUrl];
      }

      this.postService.update(id, updatePost);
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
