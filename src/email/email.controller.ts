import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('verify')
  async verifyAuthCode(
    @Body('email') email: string,
    @Body('authCode') authCode: string,
  ): Promise<{ result: 'SUCCESS' | 'ERROR' }> {
    const isValid = await this.emailService.verifyAuthCode(email, authCode);
    if (isValid) {
      return { result: 'SUCCESS' };
    } else {
      return { result: 'ERROR' };
    }
  }
}
