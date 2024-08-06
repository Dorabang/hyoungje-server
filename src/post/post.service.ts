import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './entity/post.entity';
import { Comment } from 'src/comments/entity/comments.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
  ) {}

  async create(post: Partial<Post>): Promise<Post> {
    return this.postModel.create(post);
  }

  async findAll(
    marketType: string,
    page: number = 1,
    size: number = 15,
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    result: 'SUCCESS' | 'ERROR';
    data: Post[];
    totalResult: number;
    currentPage: number;
    totalPages: number;
    isLast: boolean;
  }> {
    const offset = (page - 1) * size;

    // 총 포스트 개수 가져오기
    const totalResult = await this.postModel.count({ where: { marketType } });

    // 총 페이지 수
    const totalPages = Math.ceil(totalResult / size);

    // 마지막 페이지 여부
    const isLast = page * size >= totalResult;

    // 페이지네이션과 정렬을 적용하여 포스트 가져오기
    const posts = await this.postModel.findAll({
      where: { marketType },
      limit: size,
      offset,
      order: [[sort, order]],
    });

    return {
      result: 'SUCCESS',
      data: order === 'DESC' ? posts.sort((a, b) => b[sort] - a[sort]) : posts,
      totalResult,
      currentPage: Number(page),
      totalPages,
      isLast,
    };
  }

  async findByMarketType(marketType: string): Promise<Post[]> {
    return this.postModel.findAll({
      where: { marketType },
    });
  }

  async findOne(id: number): Promise<Post> {
    return this.postModel.findByPk(id);
  }

  async update(id: number, post: Partial<Post>): Promise<void> {
    await this.postModel.update(post, {
      where: { postId: id },
    });
  }

  async remove(id: number): Promise<void> {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new NotFoundException({ message: 'Post Not found' });
    }
    const comments = await this.commentModel.findAll({ where: { postId: id } });

    await post.destroy();
    comments.forEach(async (comment) => await comment.destroy());
  }
}
