import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { EmailRepository } from 'src/email/email.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly emailRepository: EmailRepository,
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
    const user = await User.create(userDto);

    return await this.authService.login(user);
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

  async registerEmail(email: string, id: number) {
    const emailRecord = await this.emailRepository.findEmail(email);

    if (!emailRecord) {
      return '인증되지 않은 이메일입니다.';
    }

    const user = await this.userRepository.findOne(id);

    if (!user) {
      return '사용자를 찾을 수 없습니다.';
    }

    try {
      const result = await user.update('email', email);

      await this.emailRepository.deleteEmail(email);

      return result;
    } catch (error) {
      console.log('🚀 ~ UserService ~ registerEmail ~ error:', error);
    }
  }
}
