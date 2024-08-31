import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    const duplicatedUser = User.findOne({
      where: {
        userId: userDto.userId,
      },
    });
    if (duplicatedUser === null) {
      throw new ConflictException({
        result: 'ERROR',
        message: '이미 등록되어 있는 사용자입니다.',
      });
    }

    const nicknameValid = await this.getByUserNickname(userDto);
    if (nicknameValid) {
      throw new ConflictException({
        result: 'ERROR',
        message: '이미 등록되어 있는 닉네임입니다.',
      });
    }
    return await User.create(userDto);
  }

  async getByUserId(userId: string) {
    const user = await User.findOne({
      where: {
        userId: userId,
      },
    });

    if (!user || !user?.dataValues) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }

    return user.dataValues;
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

  /**
   * 해시 비밀번호 검증 함수
   *
   * @param {string} existingPassword 기존 유저의 비밀번호
   * @param {string} password 검증이 필요한 비밀번호
   * @return {Promise<boolean>} 검증 후 true, false 리턴
   */
  async comparePassword(
    existingPassword: string,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, existingPassword);
  }

  async hashPassword(password: string) {
    const minLength = 6;
    if (password.length < minLength) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '비밀번호는 6자 이상이어야 합니다.',
      });
    }
    return bcrypt.hash(password, 10);
  }
}
