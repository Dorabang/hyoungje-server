import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bookmark } from 'src/bookmarks/entity/bookmark.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark)
    private readonly bookmarkModel: typeof Bookmark,
  ) {}

  async createBookmark(userId: number, postId: number): Promise<void> {
    await this.bookmarkModel.findOrCreate({
      where: { userId, postId },
    });
  }

  async getBookmarksByUser(userId: number): Promise<number[]> {
    const bookmarks = await this.bookmarkModel.findAll({
      where: { userId },
      attributes: ['postId'],
    });

    // postId 배열로 변환
    const postId = bookmarks.map((bookmark) => bookmark.postId);

    return postId;
  }

  async getBookmarksByPost(postId: number): Promise<number[]> {
    const bookmarks = await this.bookmarkModel.findAll({
      where: { postId },
      attributes: ['userId'],
    });

    // userId 배열로 변환
    const userIds = bookmarks.map((bookmark) => bookmark.userId);

    return userIds;
  }

  async removeBookmark(userId: number, postId: number): Promise<void> {
    const bookmark = await this.bookmarkModel.findOne({
      where: { userId, postId },
    });
    if (bookmark) {
      await bookmark.destroy();
    }
  }
}
