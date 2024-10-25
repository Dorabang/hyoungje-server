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
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

import { PostService } from './post.service';
import { Post as PostEntity } from './entity/post.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { UploadService } from 'src/upload/upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrevPostDto } from './dto/prev-post.dto';

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
    @Body() createPostDto: CreatePostDto,
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
        files.map(async (file) => {
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

  @Get('sitemap')
  async getSitemapPosts() {
    return this.postService.getSitemapPosts();
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    // 현재 게시물의 ID를 기준으로 이전과 다음 게시물을 찾기 위해 현재 게시물의 정보를 먼저 가져옵니다.
    try {
      const post = await this.postService.findOne(id);

      if (!post) {
        return res
          .status(404)
          .json({ message: '해당 게시물을 찾을 수 없습니다.' });
      }

      const prevAndNext = await this.postService.findPrevAndNextPost(id);

      return res
        .status(200)
        .json({ result: 'SUCCESS', data: { post, ...prevAndNext } });
    } catch (error) {
      console.log('🚀 ~ PostController ~ findOne ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('updateImage', 8))
  @Put(':id')
  async update(
    @Param('id') id: number,
    @UploadedFiles() files,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const payload: any = req.user;
      const user = await this.userService.getByUserId(payload.userId);
      const post = await this.postService.findOne(id);

      if (!payload.isAdmin && user.id !== post.userId) {
        throw new UnauthorizedException({
          result: 'ERROR',
          message: '접근 권한이 없는 사용자입니다.',
        });
      }

      const updatePost = { ...updatePostDto };
      if (updatePost.prevImage) {
        delete updatePost.prevImage;
      }

      if (files) {
        const imageUrl: string[] = [];

        await Promise.all(
          files.map(async (file) => {
            const key = await this.uploadService.uploadImage(file);
            imageUrl.push(process.env.AWS_BUCKET_ADDRESS + key);
          }),
        );

        // prevImage가 존재하지 않을 경우 빈 배열 할당
        const prevImage = updatePostDto.prevImage
          ? updatePostDto.prevImage.split(',')
          : [];

        updatePost['image'] = [...prevImage, ...imageUrl];
      }

      await this.postService.update(id, updatePost); // 수정: await 추가
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ PostController ~ error:', error);
      return res
        .status(404)
        .json({ result: 'ERROR', message: '해당 게시물을 찾을 수 없습니다.' });
    }
  }

  @Post('prevPosts')
  async prevDataUpload(@Body() prevPostDto: PrevPostDto) {
    const prevPost = { ...prevPostDto, views: Number(prevPostDto.views) };

    if (prevPost.image) {
      const imageUrl: string[] = [];
      await Promise.all(
        prevPost.image.map(async (item) => {
          const key = await this.uploadService.uploadFromUrl(item);
          imageUrl.push(process.env.AWS_BUCKET_ADDRESS + key);
        }),
      );

      prevPost['image'] = imageUrl;
    }

    await this.postService.create(prevPost);
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
