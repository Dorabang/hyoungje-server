import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    return this.userModel.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findOne(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async update(id: number, user: Partial<User>): Promise<void> {
    await this.userModel.update(user, { where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.userModel.destroy({ where: { id } });
  }
}
