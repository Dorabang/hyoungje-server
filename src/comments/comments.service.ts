import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from 'src/comments/entity/comments.entity';
import { Post } from 'src/post/entity/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  async createComment(
    userId: number,
    content: string,
    postId: number,
  ): Promise<Comment> {
    // 댓글이 속한 게시물이 존재하는지 확인
    const post = await this.postModel.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // 댓글 생성
    const comment = await this.commentModel.create({
      userId,
      content,
      postId,
    });

    return comment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    // 특정 게시물의 모든 댓글 가져오기
    return this.commentModel.findAll({
      where: { postId },
    });
  }

  async remove(id: number): Promise<void> {
    await this.postModel.destroy({
      where: { id },
    });
  }
}