import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  async create(post: Partial<Post>): Promise<Post> {
    return this.postModel.create(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.findAll();
  }

  async findByMarketType(marketType: string): Promise<Post[]> {
    return this.postModel.findAll({
      where: { marketType },
    });
  }

  async findOne(id: string): Promise<Post> {
    return this.postModel.findByPk(id);
  }

  async update(id: string, post: Partial<Post>): Promise<void> {
    await this.postModel.update(post, {
      where: { id },
    });
  }

  async remove(id: string): Promise<void> {
    await this.postModel.destroy({
      where: { id },
    });
  }
}
