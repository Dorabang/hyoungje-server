import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Post } from './entity/post.entity';
import { Comment } from 'src/comments/entity/comments.entity';
import { User } from 'src/user/entity/user.entity';
import { DocumentCounterService } from 'src/documentCounter/documentCounter.service';
import {
  Transaction,
  TransactionService,
} from 'src/transaction/transaction.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    private documentCounterService: DocumentCounterService,
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,
    private transactionService: TransactionService,
  ) {}

  @Transaction()
  async create(post: Partial<Post>, transaction?: any) {
    const documentNumber =
      await this.documentCounterService.getNextDocumentNumber(
        post.marketType,
        transaction,
      );

    const newPost = await this.postModel.create(
      {
        ...post,
        documentNumber,
      },
      { transaction },
    );

    return newPost;
  }

  async findAll(
    marketType: string,
    status: 'all' | 'sale' | 'sold-out' | 'reservation' = 'all',
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
    const totalResult = await this.postModel.count({
      where: { marketType, ...(status === 'all' ? null : { status }) },
    });

    // 총 페이지 수
    const totalPages = Math.ceil(totalResult / size);

    // 마지막 페이지 여부
    const isLast = page * size >= totalResult;

    // 페이지네이션과 정렬을 적용하여 포스트 가져오기
    const posts = await this.postModel.findAll({
      where: { marketType, ...(status === 'all' ? null : { status }) },
      include: [
        {
          model: User,
          as: 'user', // Post의 작성자 정보
          attributes: ['displayName'],
        },
        {
          model: User,
          as: 'bookmarkedBy', // 북마크한 사용자 정보
          attributes: ['id'],
          through: {
            attributes: [], // Bookmark 테이블의 중간 데이터를 제외
          },
        },
      ],
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
    const post = await this.postModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user', // Post의 작성자 정보
          attributes: ['displayName'],
        },
        {
          model: User,
          as: 'bookmarkedBy', // 북마크한 사용자 정보
          attributes: ['id'],
          through: {
            attributes: [], // Bookmark 테이블의 중간 데이터를 제외
          },
        },
      ],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 조회수 증가
    post.views += 1;
    await post.save();

    return post;
  }

  async findPrevAndNextPost(postId: number) {
    const currentPost = await this.postModel.findByPk(postId);

    if (!currentPost) {
      return { previous: null, next: null }; // 현재 게시물이 없을 경우
    }

    // 현재 게시물의 ID를 기준으로 이전 게시물 찾기
    const prev = await this.postModel.findOne({
      where: {
        postId: {
          [Op.lt]: postId, // 현재 게시물보다 ID가 작은 게시물
        },
      },
      order: [['postId', 'DESC']], // ID가 큰 것부터 작은 것 순서로 정렬
    });

    // 현재 게시물의 ID를 기준으로 다음 게시물 찾기
    const next = await this.postModel.findOne({
      where: {
        postId: {
          [Op.gt]: postId, // 현재 게시물보다 ID가 큰 게시물
        },
      },
      order: [['postId', 'ASC']], // ID가 작은 것부터 큰 것 순서로 정렬
    });

    return {
      previous: prev ? { title: prev.title, postId: prev.postId } : null,
      next: next ? { title: next.title, postId: next.postId } : null,
    };
  }

  @Transaction()
  async update(
    id: number,
    post: Partial<Post>,
    transaction?: any,
  ): Promise<void> {
    await this.postModel.update(post, {
      where: { postId: id },
      transaction,
    });
  }

  @Transaction()
  async remove(id: number, transaction?: any): Promise<void> {
    const post = await this.postModel.findByPk(id);
    if (!post) {
      throw new NotFoundException({
        result: 'ERROR',
        message: 'Post Not found',
      });
    }
    const comments = await this.commentModel.findAll({ where: { postId: id } });

    await post.destroy({ transaction });
    comments.forEach(async (comment) => await comment.destroy({ transaction }));
  }

  async getSitemapPosts() {
    return await this.postModel.findAll({
      attributes: ['id', 'updatedAt', 'marketType'],
    });
  }
}
