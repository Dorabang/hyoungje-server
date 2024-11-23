import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as nodemailer from 'nodemailer';

import { EmailRepository } from './email.repository';
import { User } from 'src/user/entity/user.entity';
import { generatePasswordResetEmail } from 'src/utils/mail';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailRepository: EmailRepository,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async sendMail(option: { to: string; subject: string; html: string }) {
    const { to, subject, html } = option;

    const transporter = nodemailer.createTransport({
      service: 'naver',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendAuthCode(
    mailOptions: {
      to: string;
      subject: string;
      html: string;
    },
    code: string,
  ): Promise<void> {
    const emailRecord = await this.emailRepository.findEmail(mailOptions.to);
    if (!emailRecord) {
      await this.emailRepository.createEmail(mailOptions.to, code);
    } else {
      const newCodeExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5분

      const emailRecord = await this.emailRepository.findEmail(mailOptions.to);

      emailRecord.authCode = code;
      emailRecord.tokenExpires = newCodeExpiration;
      await emailRecord.save();
    }

    await this.sendMail(mailOptions);
  }

  async verifyAuthCode(
    email: string,
    authCode: string,
  ): Promise<string | boolean> {
    const emailRecord = await this.emailRepository.findEmail(email);

    if (!emailRecord) {
      throw new Error('인증 코드의 유효 시간이 만료되었습니다.');
    }

    if (emailRecord && emailRecord.authCode === authCode) {
      if (emailRecord.updatedAt)
        // 인증 성공 후 데이터 삭제
        await this.emailRepository.deleteEmail(email);
      return true;
    }

    return false;
  }

  generateAuthCode(): string {
    // 6자리 인증 코드 생성
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendResetPasswordEmail(email: string, userId: string): Promise<void> {
    const user = await this.userModel.findOne({ where: { userId } });
    const code = this.generateAuthCode();
    await this.emailRepository.createEmail(user.email, code);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.email !== email) {
      throw new Error('Email not verified');
    }

    const mailOptions = {
      to: user.email,
      subject: '[옥동] 비밀번호 재설정 메일',
      html: generatePasswordResetEmail(code, userId),
    };

    await this.sendMail(mailOptions);
  }
}
