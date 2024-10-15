import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { User } from './entity/user.entity';
import {
  Transaction,
  TransactionService,
} from 'src/transaction/transaction.service';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly transactionService: TransactionService,
  ) {}

  @Transaction()
  async create(user: Partial<User>, transaction?: any): Promise<User> {
    return this.userModel.create(user, { transaction });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }

  @Transaction()
  async update(
    id: number,
    user: Partial<User>,
    transaction?: any,
  ): Promise<void> {
    await this.userModel.update(user, { where: { id }, transaction });
  }

  @Transaction()
  async remove(id: number, transaction?: any): Promise<void> {
    await this.userModel.destroy({ where: { id }, transaction });
  }
}
