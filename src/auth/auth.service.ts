import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

    return user.dataValues;
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userService.getByUserId(loginUserDto.userId);
    const passwordValid = await this.userService.comparePassword(
      loginUserDto.password,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException({
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
        { userId: payload.userId, sub: payload.sub, isAdmin: payload.isAdmin },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        },
      );

      return newAccessToken;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ refresh ~ error:', error);
      throw new UnauthorizedException();
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
}
