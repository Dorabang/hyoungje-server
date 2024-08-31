import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UploadModule } from 'src/upload/upload.module';
import { Bookmark } from 'src/bookmarks/entity/bookmark.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([User, Bookmark]), UploadModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
