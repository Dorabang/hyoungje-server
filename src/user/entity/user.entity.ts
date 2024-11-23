import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from 'src/post/entity/post.entity';
import { Bookmark } from 'src/bookmarks/entity/bookmark.entity';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isAdmin: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  displayName: string;

  @BelongsToMany(() => Post, () => Bookmark) // 북마크한 게시물들
  bookmarkedPosts: Post[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @HasMany(() => Post)
  posts: Post[];
}
