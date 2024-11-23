import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize-typescript';

import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    private readonly sequelize: Sequelize,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userService.getByUserId(loginUserDto.userId);
    const passwordValid = await this.userService.comparePassword(
      user.password,
      loginUserDto.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '아이디 혹은 비밀번호를 잘못 입력하셨습니다.',
      });
    }

    if (user && passwordValid) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = this.jwtService.sign(
        { userId: payload.userId, sub: payload.sub, isAdmin: payload.isAdmin },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        },
      );

      return newAccessToken;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ refresh ~ error:', error);
      throw new UnauthorizedException({
        result: 'ERROR',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  async login(user: any) {
    const payload = {
      userId: user.userId,
      sub: user.id,
      isAdmin: user.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'jwt_secret',
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
      }),
    };
  }

  async sendVerificationToEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      to: email,
      subject: '[옥동] 비밀번호 초기화용 계정 인증 메일',
      html: `<h2>안녕하세요 회원님. 비밀번호 초기화를 위해 아래 버튼을 눌러 이메일을 인증해주세요.</h2>
      <a href='${process.env.DEV_FRONT_URL}/password?code=${code}'>비밀번호 초기화</a>
      <p>본인이 아니라면 홈페이지 로그인 후, 비밀번호를 변경해주세요.</p>`,
    };

    await this.emailService.sendAuthCode(mailOptions, code);
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await this.emailService.verifyAuthCode(email, code);

      if (!result) {
        throw new ConflictException({
          result: 'ERROR',
          message: '인증 코드가 바르지 않습니다.',
        });
      }

      const user = await this.userModel.findOne({ where: { email } });

      if (!user) {
        throw new ConflictException({
          result: 'ERROR',
          message: 'User not found',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save({ transaction });

      // 비밀번호 초기화 후 새로운 JWT 토큰 발급
      transaction.commit();
      return this.login(user);
    } catch (error) {
      console.log('🚀 ~ AuthService ~ error:', error);
      transaction.rollback();
    }
  }
}
