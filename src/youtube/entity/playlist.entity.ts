import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Channel } from './channel.entity';

@Table
export class Playlist extends Model<Playlist> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Channel)
  @Column
  channelId: number;

  @BelongsTo(() => Channel)
  channel: Channel;

  @Column({
    type: DataType.STRING,
  })
  title: string;

  @Column({
    type: DataType.STRING,
  })
  thumbnail: string;

  @Column({
    type: DataType.STRING,
  })
  publishedAt: string;

  @Column({
    type: DataType.STRING,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  videoId: string;
}
