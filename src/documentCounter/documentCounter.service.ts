import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentCounter } from './entity/documentCounter.entity';

@Injectable()
export class DocumentCounterService {
  constructor(
    @InjectModel(DocumentCounter)
    private documentCounterModel: typeof DocumentCounter,
  ) {}

  async getNextDocumentNumber(
    marketType: string,
    transaction: any,
  ): Promise<number> {
    let documentCounter = await this.documentCounterModel.findOne({
      where: { marketType },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!documentCounter) {
      documentCounter = await this.documentCounterModel.create(
        { marketType, counter: 1 },
        { transaction },
      );
    } else {
      documentCounter.counter += 1;
      await documentCounter.save({ transaction });
    }

    return documentCounter.counter;
  }
}
