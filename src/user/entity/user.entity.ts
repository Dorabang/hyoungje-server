import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  bookmark: string[];

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
    allowNull: true,
  })
  profile: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;
}
