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

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

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
    } catch (error) {
      console.log('🚀 ~ UserController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Get('all')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('info')
  async findOne(@Req() req: Request, @Res() res: Response) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException({ result: 'ERROR' });
    }
    const { password, verificationCode, ...userInfo } = user;

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
      this.userService.update(user.id, { password: newPassword });
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
      await this.userService.update(user.id, updateUser);
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
      this.userService.remove(user.id);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ UserController ~ remove ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }
}
