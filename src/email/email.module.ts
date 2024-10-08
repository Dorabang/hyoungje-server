import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailRepository } from './email.repository';
import { Email } from './entity/email.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entity/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Email, User]),
    forwardRef(() => UserModule),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailRepository],
  exports: [EmailService, EmailRepository],
})
export class EmailModule {}
