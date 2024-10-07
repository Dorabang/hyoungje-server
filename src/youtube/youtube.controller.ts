import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Res,
  Param,
  InternalServerErrorException,
  Req,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { YoutubeService } from './youtube.service';
import { Channel } from './entity/channel.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';

@Controller('youtube')
export class YoutubeController {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('channels')
  async getAllChannels(
    @Query('type') type: 'special' | 'general',
    @Query('sort') sort: 'name' | 'createdAt',
    @Res() res: Response,
  ) {
    let data: Channel[] = [];
    try {
      if (type === 'special') {
        data = await this.youtubeService.getAllSpecialChannels();
      } else {
        data = await this.youtubeService.getAllGeneralChannels(sort);
      }
      return res.status(200).json({ result: 'SUCCESS', data });
    } catch (error) {
      console.log('🚀 ~ YoutubeController ~ error:', error);
      throw new InternalServerErrorException({ reulst: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Post('channels')
  async createChannel(
    @Body() channelDto: Partial<Channel>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const channel = { ...channelDto };

    try {
      const user = await this.userService.getByUserId(payload.userId);

      if (!user || !user.isAdmin) {
        throw new UnauthorizedException({
          result: 'ERROR',
          message: '접근 권한이 없는 사용자입니다.',
        });
      }

      await this.youtubeService.createChannel(channel);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ CommentsController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @UseGuards(AuthGuard)
  @Put('channels/:id')
  @UseInterceptors(FileInterceptor('profile'))
  async updateChannel(
    @Param() id: number,
    @Body() channelDto: Partial<Channel>,
    @UploadedFile() file,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const payload: any = req.user;
    const user = await this.userService.getByUserId(payload.sub);

    if (!user || !user.isAdmin) {
      throw new UnauthorizedException({
        result: 'ERROR',
        message: '접근 권한이 없는 사용자입니다.',
      });
    }

    const channel = { ...channelDto };

    try {
      if (file) {
        const key = await this.uploadService.uploadImage(file);
        const imageUrl = process.env.AWS_BUCKET_ADDRESS + key;
        channel['profile'] = imageUrl;
      }

      await this.youtubeService.updateChannel(id, channel);
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ CommentsController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Get('channels/:id')
  async getChannel(@Param('id') id: string) {
    return this.youtubeService.getChannel(id);
  }

  @Get('playlist/:channelId')
  async getPlaylist(
    @Param('channelId') channelId: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.youtubeService.getPlaylist(channelId);
      return res.status(200).json({ result: 'SUCCESS', data });
    } catch (error) {
      console.log('🚀 ~ YoutubeController ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }

  @Get('refresh')
  async refreshData(@Res() res: Response) {
    try {
      this.youtubeService.refreshData();
      return res.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
      console.log('🚀 ~ YoutubeController ~ refreshData ~ error:', error);
      throw new InternalServerErrorException({ result: 'ERROR' });
    }
  }
}
