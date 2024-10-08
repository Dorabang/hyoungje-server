import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'email', timestamps: true })
export class Email extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  authCode: string;

  @Column(DataType.DATE)
  tokenExpires: Date;
}
