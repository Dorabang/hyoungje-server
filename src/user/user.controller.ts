import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  ConflictException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { UserRepository } from './user.repository';

@Controller('users')
export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('email')
  async email(
    @Req() req: Request,
    @Res() res: Response,
    @Body('email') email: string,
  ) {
    const user: any = req.user;
    const result = await this.userService.registerEmail(email, user.sub);

    if (typeof result === 'string') {
      throw new ConflictException({ result: 'ERROR', message: result });
    }

    return res
      .status(200)
      .json({ result: 'SUCCESS', message: '이메일 인증이 완료되었습니다.' });
  }

  @Post()
  @UseInterceptors(FileInterceptor('profile'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file,
    @Res() res: Response,
  ) {
    const createUser = { ...createUserDto };
    if (file) {
      const key = await this.uploadService.uploadImage(file);
      const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;
      createUser['profile'] = imageUrl;
    }
    createUser['isAdmin'] = false;
    try {
      const token = await this.userService.createUser(createUser);

      res.cookie('access_token', token.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 60 * 60 * 1000, // 1시간
      });
      res.cookie('refresh_token', token.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      });

      return res
        .status(200)
        .json({ result: 'SUCCESS', message: 'login successful' });
    } catch (error) {
      console.log('🚀 ~ UserController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Get('all')
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('info')
  async findOne(@Req() req: Request, @Res() res: Response) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException({ result: 'ERROR' });
    }
    const { password, ...userInfo } = user;

    return res.status(200).json({ result: 'SUCCESS', data: userInfo });
  }

  @UseGuards(AuthGuard)
  @Post('password')
  async checkPasswordValidation(
    @Body() unverifiedPassword,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    try {
      const result = await this.userService.comparePassword(
        user.password,
        unverifiedPassword.password,
      );
      return res.status(200).json({ result: 'SUCCESS', data: result });
    } catch (error) {
      console.log('🚀 ~ UserController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Put('password')
  async updatePassword(
    @Body() updatePassword,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    const newPassword = await this.userService.hashPassword(
      updatePassword.password,
    );
    try {
      this.userRepository.update(user.id, { password: newPassword });
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ UserController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  @UseInterceptors(FileInterceptor('profile'))
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const updateUser = { ...updateUserDto };
    if (file) {
      const key = await this.uploadService.uploadImage(file);
      const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;
      updateUser['profile'] = imageUrl;
    }
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    try {
      await this.userRepository.update(user.id, updateUser);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ UserController ~ error:', error);
      return res.status(500).json({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async remove(@Req() req: Request, @Res() res: Response) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    try {
      this.userRepository.remove(user.id);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ UserController ~ remove ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Post('/findUserId')
  async getUserId(@Body() userData: { email: string; name: string }) {
    const user = await this.userRepository.findByCriteria({
      email: userData.email,
    });

    if (!user) {
      return { result: 'ERROR', message: '사용자를 찾을 수 없습니다.' };
    }
    const maskedUserId = this.userService.maskUserId(user.userId); // 아이디 마스킹 처리

    return {
      result: 'SUCCESS',
      data: { name: user.name, userId: maskedUserId },
    };
  }

  @Post('/reset-password-email')
  async requestResetPasswordEmail(
    @Body() userData: { userId: string; email: string },
  ) {
    const user = await this.userService.findUserByEmail(userData.email);

    await this.userService.sendResetPasswordEmail(user.email, user.userId);
    return { result: 'SUCCESS' };
  }

  @Put('/reset-password')
  async confirmResetPassword(
    @Body() data: { code: string; userId: string; password: string },
  ) {
    return this.userService.resetPassword(
      data.code,
      data.userId,
      data.password,
    );
  }
}
