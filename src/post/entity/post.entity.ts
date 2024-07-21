import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/entity/user.entity';

@Table({
  tableName: 'posts',
})
export class Post extends Model<Post> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  image: string[];

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  createdAt: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  updatedAt: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  height: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  bookmark: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  num: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  place: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  price: string;

  @Column({
    type: DataType.ENUM('sale', 'sold-out', 'reservation'),
    allowNull: false,
  })
  status: 'sale' | 'sold-out' | 'reservation';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  variant: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  views: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
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
}
