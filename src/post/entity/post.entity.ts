import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Comment } from 'src/comments/entity/comments.entity';
import { User } from 'src/user/entity/user.entity';

@Table({
  tableName: 'posts',
})
export class Post extends Model<Post> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  postId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  image: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  amount: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  height: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  bookmark: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  place: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  price: string;

  @Column({
    type: DataType.ENUM('sale', 'sold-out', 'reservation'),
    allowNull: true,
  })
  status: 'sale' | 'sold-out' | 'reservation';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  variant: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0, // 조회수의 기본값을 0으로 설정
  })
  views: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  width: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  contents: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  marketType: string;

  @Column(DataType.INTEGER)
  documentNumber: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  commentCount: number; // 댓글 수 칼럼

  @HasMany(() => Comment)
  comments: Comment[];
}
