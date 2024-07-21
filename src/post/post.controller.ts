import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostEntity } from './entity/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: Partial<PostEntity>) {
    return this.postService.create(createPostDto);
  }

  @Get()
  findAll(@Query('marketType') marketType?: string) {
    if (marketType) {
      return this.postService.findByMarketType(marketType);
    }
    return this.postService.findAll();
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
