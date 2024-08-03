import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByJwt(payload: any) {
    const user = await this.userService.getByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.dataValues;
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userService.getByUserId(loginUserDto.userId);
    if (user === null) {
      throw new UnauthorizedException({
        error: 'E001',
        message: '사용자를 찾을 수 없습니다.',
      });
    }
    const passwordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException({
        error: 'E002',
        message: '비밀번호를 잘못 입력하셨습니다.',
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
        { userId: payload.userId, sub: payload.sub },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        },
      );

      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async login(user: any) {
    const payload = { userId: user.dataValues.userId, sub: user.dataValues.id };

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
}
