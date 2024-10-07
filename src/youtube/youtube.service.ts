// services/youtube.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { google, youtube_v3 } from 'googleapis';

import { Channel } from './entity/channel.entity';
import { Playlist } from './entity/playlist.entity';

@Injectable()
export class YoutubeService {
  private youtube: youtube_v3.Youtube;

  constructor(
    @InjectModel(Channel)
    private channelModel: typeof Channel,
    @InjectModel(Playlist)
    private playlistItemModel: typeof Playlist,
    private sequelize: Sequelize, // Sequelize 인스턴스 주입
  ) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: `${process.env.YOUTUBE_API_KEY}`,
    });
  }

  async createChannel(channel: Partial<Channel>) {
    return this.channelModel.create(channel);
  }

  async updateChannel(id: number, channel: Partial<Channel>) {
    await this.channelModel.update(channel, { where: { id } });
  }

  async refreshData() {
    const channels = await this.channelModel.findAll({
      where: {
        channelId: { [Op.ne]: null },
      },
    });

    for (const channel of channels) {
      const playlistItems: Partial<Playlist>[] = await this.fetchPlaylistItems(
        channel.channelId,
      );
      await this.updatePlaylistItems(channel.id, playlistItems);
    }
  }

  private async fetchPlaylistItems(channelId: string) {
    const response = await this.youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: `UU${channelId.substring(2)}`,
      maxResults: 10,
    });

    return response.data.items.map((item) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      videoId: item.contentDetails.videoId,
      publishedAt: item.contentDetails.videoPublishedAt,
    })) as Partial<Playlist>[];
  }

  private async updatePlaylistItems(id: number, items: Partial<Playlist>[]) {
    const transaction = await this.sequelize.transaction();
    const prevPlaylist = await this.getPlaylist(id);
    try {
      if (prevPlaylist) {
        await this.playlistItemModel.destroy({
          where: { channelId: id },
          transaction,
        });
      }
      await this.playlistItemModel.bulkCreate(
        items.map((item) => ({ ...item, channelId: id })),
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log('🚀 ~ YoutubeService ~ 84 ~ error:', error);
    }
  }

  async getAllSpecialChannels() {
    return this.channelModel.findAll({
      where: { channelId: { [Op.ne]: null } },
    });
  }

  async getAllGeneralChannels(sort: 'name' | 'createdAt') {
    return this.channelModel.findAll({
      where: { channelId: null },
      order: [[sort, 'ASC']],
    });
  }

  async getChannel(id: string) {
    const channel = await this.channelModel.findByPk(id);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    return channel;
  }

  async getPlaylist(channelId: number) {
    const channel = await this.channelModel.findOne({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }
    return this.playlistItemModel.findAll({
      where: { channelId: channel.id },
    });
  }
}
