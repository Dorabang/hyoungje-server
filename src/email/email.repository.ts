import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Email } from './entity/email.entity';
import { Op } from 'sequelize';

@Injectable()
export class EmailRepository {
  constructor(
    @InjectModel(Email)
    private readonly emailModel: typeof Email,
  ) {}

  async createEmail(email: string, authCode: string): Promise<Email> {
    const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);
    return this.emailModel.create({ email, authCode, tokenExpires });
  }

  async findEmail(email: string): Promise<Email> {
    return this.emailModel.findOne({
      where: { email, tokenExpires: { [Op.gt]: new Date() } },
    });
  }

  async deleteEmail(email: string): Promise<void> {
    await this.emailModel.destroy({ where: { email } });
  }
}
