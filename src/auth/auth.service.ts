import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as nodemailer from 'nodemailer';

import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
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
      const { password, isAdmin, ...result } = user;
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
    const transporter = nodemailer.createTransport({
      service: 'naver',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      // from: 'no-reply@hyoungje.kr',
      from: process.env.EMAIL,
      to: email,
      subject: '[옥동] 비밀번호 초기화용 계정 인증 메일',
      text: `안녕하세요 회원님. 비밀번호 초기화를 위해 아래 버튼을 눌러 이메일을 인증해주세요.
      ${code}
      본인이 아니라면 홈페이지 로그인 후, 비밀번호를 변경해주세요.`,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.email !== email) {
      throw new Error('Email not verified');
    }

    const code = await this.generateVerificationCode();

    const transporter = nodemailer.createTransport({
      service: 'naver',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      // from: 'no-reply@hyoungje.kr',
      from: process.env.EMAIL,
      to: user.email,
      subject: '[옥동] 이메일 인증 메일',
      text: `### 안녕하세요 회원님. 이메일 인증를 위해 아래 버튼을 눌러 이메일을 인증해주세요.
      * ${code} *
      본인이 아니라면 홈페이지 로그인 후, 비밀번호를 변경해주세요.`,
    };

    await transporter.sendMail(mailOptions);
  }

  // async resetPassword(
  //   token: string,
  //   newPassword: string,
  // ): Promise<{ access_token: string; refresh_token: string }> {
  //   const email = await this.verifyResetToken(token);

  //   const user = await this.userModel.findOne({ where: { email } });

  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   const hashedPassword = await bcrypt.hash(newPassword, 10);
  //   user.password = hashedPassword;

  //   await user.save();

  //   // 비밀번호 초기화 후 새로운 JWT 토큰 발급
  //   return this.login(user);
  // }

  async generateVerificationCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(userId: number): Promise<void> {
    const user = await this.userModel.findByPk(userId);
    const verificationCode = await this.generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    return await this.sendVerificationToEmail(user.email, verificationCode);
  }

  async confirmVerificationCode(verificationCode: string, userId: number) {
    try {
      const user = await this.userModel.findByPk(userId);

      const savedCode = user.verificationCode;
      if (!savedCode) {
        throw new BadRequestException('저장된 인증 코드가 없습니다.');
      }

      if (savedCode !== verificationCode) {
        throw new BadRequestException('인증 코드가 일치하지 않습니다.');
      }

      const res = await this.userService.isVerified(verificationCode, user.id);
      console.log('🚀 ~ AuthService ~ confirmVerificationCode ~ res:', res);
      await this.clearVerificationCode(user);

      return { result: 'SUCCESS', message: '인증 코드가 확인되었습니다.' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '인증 코드 확인 중 오류가 발생했습니다.',
      );
    }
  }

  async clearVerificationCode(user: User): Promise<void> {
    const userId = await this.userModel.findByPk(user.id);

    if (!userId) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.userService.clearVerificationCode(
      user.email,
      user.verificationCode,
    );
  }
}
