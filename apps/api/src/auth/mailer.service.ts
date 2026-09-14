import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly webOrigin = (
    process.env.WEB_ORIGIN?.split(',')[0] ?? 'http://localhost:3000'
  ).trim();

  sendVerificationEmail(email: string, token: string): void {
    const link = `${this.webOrigin}/verify-email?token=${token}`;
    this.logger.log(`Verification email for ${email}: ${link}`);
  }
}
