import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Email } from './entity/email.entity';
import { Op } from 'sequelize';
import {
  Transaction,
  TransactionService,
} from 'src/transaction/transaction.service';

@Injectable()
export class EmailRepository {
  constructor(
    @InjectModel(Email)
    private readonly emailModel: typeof Email,
    private readonly transactionService: TransactionService,
  ) {}

  @Transaction()
  async createEmail(
    email: string,
    authCode: string,
    transaction?: any,
  ): Promise<Email> {
    const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);
    return this.emailModel.create({
      email,
      authCode,
      tokenExpires,
      transaction,
    });
  }

  async findEmail(email: string): Promise<Email> {
    return this.emailModel.findOne({
      where: { email, tokenExpires: { [Op.gt]: new Date() } },
    });
  }

  @Transaction()
  async deleteEmail(email: string, transaction?: any): Promise<void> {
    await this.emailModel.destroy({ where: { email }, transaction });
  }
}
