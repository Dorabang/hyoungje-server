import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async createUser(userDto: CreateUserDto) {
    userDto.password = await this.hashPassword(userDto.password);
    const duplicatedUser = await this.getByUserId(userDto.userId);
    const nicknameValid = await this.getByUserNickname(userDto);
    if (duplicatedUser) {
      throw new ConflictException({
        error: 'E001',
        message: '이미 등록되어 있는 사용자입니다.',
      });
    }
    if (nicknameValid) {
      throw new ConflictException({
        error: 'E002',
        message: '이미 등록되어 있는 닉네임입니다.',
      });
    }
    return await User.create(userDto);
  }

  async getByUserId(userId: string) {
    return User.findOne({
      where: {
        userId: userId,
      },
    });
  }

  async getByUserNickname(userDto: CreateUserDto) {
    return User.findOne({
      attributes: ['displayName'],
      where: {
        displayName: userDto.displayName,
      },
    });
  }

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

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
