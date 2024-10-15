import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentCounter } from './entity/documentCounter.entity';
import { DocumentCounterService } from './documentCounter.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([DocumentCounter])],
  providers: [DocumentCounterService, TransactionService],
  exports: [DocumentCounterService],
})
export class DocumentCounterModule {}
