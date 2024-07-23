import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = this.authService.login(user);
    res.cookie('access_token', (await token).access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1 * 60 * 60 * 1000, // 1시간
    });
    res.cookie('access_token', (await token).access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return res.status(200).json({ message: 'login successful' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.headers.authorization.slice(7);
    const accessToken = this.authService.refresh(refreshToken);

    return res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1 * 60 * 60 * 1000, // 1시간
    });
  }
}
