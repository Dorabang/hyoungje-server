import {
  BadRequestException,
  Body,
  Controller,
  forwardRef,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';
import { generateEmailVerificationEmail } from 'src/utils/mail';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

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

    return res
      .status(200)
      .json({ result: 'SUCCESS', message: 'login successful' });
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
      res.redirect('http://localhost:3000/login');
      throw new UnauthorizedException({
        result: 'ERROR',
        code: 'T003',
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

  @UseGuards(AuthGuard)
  @Post('sendcode')
  async sendCode(
    @Req() req: Request,
  ): Promise<{ result: 'SUCCESS' | 'ERROR' }> {
    const payload: any = req.user;
    const user = (await this.userService.getByUserId(payload.userId))
      .dataValues;

    const code = this.emailService.generateAuthCode();
    const mailOptions = {
      to: user.email,
      subject: '',
      html: ``,
    };

    try {
      this.emailService.sendAuthCode(mailOptions, code);
      return { result: 'SUCCESS' };
    } catch (error) {
      console.log('🚀 ~ AuthController ~ sendCode ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Post('verify')
  async verifyEmail(
    @Body('email') email: string,
  ): Promise<{ result: 'SUCCESS' | 'ERROR' }> {
    const code = this.emailService.generateAuthCode();
    const mailOptions = {
      to: email,
      subject: '[옥동] 이메일 인증',
      html: generateEmailVerificationEmail(code),
    };

    try {
      this.emailService.sendAuthCode(mailOptions, code);
      return { result: 'SUCCESS' };
    } catch (error) {
      console.log('🚀 ~ AuthController ~ sendCode ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Post('/confirmcode')
  async confirmCode(
    @Body('email') email: string,
    @Body('verificationCode') verificationCode: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.emailService.verifyAuthCode(
        email,
        verificationCode,
      );
      if (result) {
        return res.status(200).json({ result: 'SUCCESS' });
      } else {
        return res.status(400).json({
          result: 'ERROR',
          message: '입력하신 인증코드가 올바르지 않습니다. 다시 시도해주세요.',
        });
      }
    } catch (error) {
      console.log('🚀 ~ AuthController ~ error:', error);
      if (error.result === 'ERROR') {
        return res
          .status(400)
          .json({ result: 'ERROR', message: error.message });
      }
      throw new BadRequestException({ result: 'ERROR' });
    }
  }
}
