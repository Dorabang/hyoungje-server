import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentCounter } from './entity/documentCounter.entity';
import { DocumentCounterService } from './documentCounter.service';

@Module({
  imports: [SequelizeModule.forFeature([DocumentCounter])],
  providers: [DocumentCounterService],
  exports: [DocumentCounterService],
})
export class DocumentCounterModule {}
