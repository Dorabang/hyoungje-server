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
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entity/post.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: Partial<PostEntity>, @Req() req: Request) {
    console.log('🚀 ~ PostController ~ create ~ req:', req);
    const accessToken = req.cookies?.access_token;
    const validateUser = this.authService.validateUserByJwt(accessToken);

    if (validateUser) {
      // return this.postService.create(createPostDto);
    }
    throw new UnauthorizedException();
  }

  @Get()
  async findAll(
    @Query('marketType') marketType: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: PostEntity[]; total: number; isLast: boolean }> {
    return this.postService.findAll(marketType, page, size, sort, order);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePostDto: Partial<PostEntity>) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
