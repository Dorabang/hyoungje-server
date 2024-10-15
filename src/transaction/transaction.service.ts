import { Sequelize } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(private sequelize: Sequelize) {}

  async runInTransaction<T>(
    operation: (transaction: any) => Promise<T>,
  ): Promise<T> {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export function Transaction() {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const transactionService = this.transactionService;
      if (!transactionService) {
        throw new Error('TransactionService is not injected in the class');
      }

      return transactionService.runInTransaction(async (transaction) => {
        return originalMethod.apply(this, [...args, transaction]);
      });
    };

    return descriptor;
  };
}
