import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { YoutubeController } from './youtube.controller';
import { Channel } from './entity/channel.entity';
import { YoutubeService } from './youtube.service';
import { Playlist } from './entity/playlist.entity';
import { UploadModule } from 'src/upload/upload.module';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([Channel, Playlist]), UploadModule],
  controllers: [YoutubeController],
  providers: [YoutubeService, TransactionService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
