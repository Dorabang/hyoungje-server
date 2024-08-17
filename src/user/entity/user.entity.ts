import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Post } from 'src/post/entity/post.entity';

@Table
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
  displayName: string;

  @Column({
    type: DataType.STRING,
  })
  bookmark: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @HasMany(() => Post)
  posts: Post[];
}
