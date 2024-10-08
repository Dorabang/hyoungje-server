import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from 'src/comments/entity/comments.entity';
import { Post } from 'src/post/entity/post.entity';
import {
  Transaction,
  TransactionService,
} from 'src/transaction/transaction.service';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    private readonly transactionService: TransactionService,
  ) {}

  @Transaction()
  async createComment(
    userId: number,
    content: string,
    postId: number,
    transaction?: any,
  ): Promise<Comment> {
    // 댓글이 속한 게시물이 존재하는지 확인
    const post = await this.postModel.findByPk(postId);
    if (!post) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Post not found',
      });
    }

    // 댓글 생성
    const comment = await this.commentModel.create(
      {
        userId,
        content,
        postId,
      },
      {
        transaction,
      },
    );

    await post.increment('commentCount', { transaction });

    return comment;
  }

  async getMyComments(userId: number) {
    return await this.postModel.findAll({ where: { userId } });
  }

  async getCommentsByPost(
    postId: number,
    page: number = 1,
    size: number = 15,
    sort: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    result: 'SUCCESS';
    data: Comment[];
    totalResult: number;
    currentPage: number;
    totalPages: number;
    isLast: boolean;
  }> {
    const offset = (page - 1) * size;

    // 총 댓글 개수 가져오기
    const totalResult = await this.commentModel.count({ where: { postId } });

    // 총 페이지 수
    const totalPages = Math.ceil(totalResult / size);

    // 마지막 페이지 여부
    const isLast = page * size >= totalResult;

    // 특정 게시물의 모든 댓글 가져오기
    const comments = await this.commentModel.findAll({
      where: { postId },
      include: [{ model: User, attributes: ['displayName'] }],
      limit: size,
      offset,
      order: [[sort, order]],
    });

    return {
      result: 'SUCCESS',
      data:
        order === 'DESC'
          ? comments.sort((a, b) => b[sort] - a[sort])
          : comments,
      totalResult,
      currentPage: Number(page),
      totalPages,
      isLast,
    };
  }

  @Transaction()
  async update(
    id: number,
    content: Partial<Comment>,
    transaction?: any,
  ): Promise<void> {
    await this.commentModel.update(content, { where: { id }, transaction });
  }

  async findOne(id: number) {
    return await this.commentModel.findByPk(id);
  }

  @Transaction()
  async remove(id: number, transaction?: any): Promise<void> {
    const comment = await this.commentModel.findByPk(id);

    if (!comment) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Comment not found',
      });
    }

    const post = await this.postModel.findByPk(comment.postId);

    if (!post) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Post not found',
      });
    }

    await comment.destroy({ transaction });
    await post.decrement('commentCount', { transaction });
  }
}
