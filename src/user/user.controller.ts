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
  async findOne(@Req() req: Request): Promise<Partial<User>> {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, isAdmin, ...userInfo } = user;

    return userInfo;
  }

  @UseGuards(AuthGuard)
  @Put('password')
  async updatePassword(
    @Body() updatePassword: { password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);
    const newPassword = await this.userService.hashPassword(
      updatePassword.password,
    );

    this.userService.update(user.id, { password: newPassword });
    return res.status(200).json({ result: 'SUCCESS' });
  }

  @Put()
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);

    this.userService.update(user.id, updateUserDto);
    return res.status(200).json({ result: 'SUCCESS' });
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
