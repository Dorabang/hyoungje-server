import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookmarksService } from './bookmark.service';
import { BookmarksController } from './bookmark.controller';
import { Bookmark } from './entity/bookmark.entity';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([Bookmark])],
  providers: [BookmarksService, TransactionService],
  controllers: [BookmarksController],
})
export class BookmarksModule {}
