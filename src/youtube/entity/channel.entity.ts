import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Playlist } from 'src/youtube/entity/playlist.entity';

@Table
export class Channel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  channelId: string;

  @HasMany(() => Playlist)
  playlistItems: Playlist[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  summary: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string; // 채널 이름 같은 추가 정보도 저장 가능

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile: string;
}
