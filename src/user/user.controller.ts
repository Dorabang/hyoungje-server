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
    @UploadedFile() file: File,
  ): Promise<{ result: 'SUCCESS' | 'ERROR' }> {
    const createUser = { ...createUserDto };
    if (file) {
      const key = await this.uploadService.uploadImage(file);
      const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;
      createUser['profile'] = imageUrl;
    }
    createUser['isAdmin'] = false;
    try {
      this.userService.createUser(createUser);
      return { result: 'SUCCESS' };
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
    const { password, isAdmin, bookmark, ...userInfo } = user;

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
    @UploadedFile() file: File,
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

    this.userService.remove(user.id);
    console.log('사용자 삭제');
    return res.status(200).json({ result: 'SUCCESS' });
  }
}
