import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from 'src/user/entity/user.entity';
import { Post } from 'src/post/entity/post.entity';

@Table({ tableName: 'Bookmarks', timestamps: false })
export class Bookmark extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Post)
  @Column
  postId: number;
}
