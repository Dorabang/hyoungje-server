import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const createUser = { isAdmin: false, ...createUserDto };
    return this.userService.createUser(createUser);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get()
  async findOne(@Req() req: Request): Promise<User> {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.userId);

    return this.userService.findOne(user.id);
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
