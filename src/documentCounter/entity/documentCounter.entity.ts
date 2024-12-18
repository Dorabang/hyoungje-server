import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class DocumentCounter extends Model<DocumentCounter> {
  @Column({ primaryKey: true })
  marketType: string;

  @Column
  counter: number;
}
