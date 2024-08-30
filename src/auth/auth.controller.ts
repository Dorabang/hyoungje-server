import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '아이디 혹은 비밀번호를 잘못 입력하셨습니다.',
      });
    }

    const token = this.authService.login(user);
    res.cookie('access_token', (await token).access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1 * 60 * 60 * 1000, // 1시간
    });
    res.cookie('refresh_token', (await token).refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return res.status(200).json({ message: 'login successful' });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    if (req.cookies['access_token']) {
      res.clearCookie('access_token');
    }
    res.clearCookie('refresh_token');

    return res.status(200).json({ result: 'SUCCESS' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      res.clearCookie('refresh_token');
      throw new UnauthorizedException({
        result: 'ERROR',
        message: 'Refresh token not found',
      });
    }

    try {
      const accessToken = await this.authService.refresh(refreshToken);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 60 * 60 * 1000, // 1시간
      });

      return res.status(200).json({
        message: 'Access Token refreshed successfully.',
        access_token: accessToken,
      });
    } catch (err) {
      console.log('🚀 ~ AuthController ~ refresh ~ err:', err);
      if (err.status === 401) {
        res.clearCookie('refresh_token');
      }
      return res.status(err.status).json(err.response);
    }
  }
}
