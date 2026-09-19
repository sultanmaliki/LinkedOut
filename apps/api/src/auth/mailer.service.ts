import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly webOrigin = (
    process.env.WEB_ORIGIN?.split(',')[0] ?? 'http://localhost:3000'
  ).trim();
  private readonly fromAddress =
    process.env.RESEND_FROM_EMAIL ?? 'LinkedOut <onboarding@resend.dev>';

  // Lazily constructed so a missing RESEND_API_KEY doesn't throw at boot --
  // it just means we fall back to logging the link (dev/test default).
  // Resend's constructor doesn't validate the key itself, so this alone
  // wouldn't catch a missing key; the undefined check below is what does.
  private readonly resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : undefined;

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const link = `${this.webOrigin}/verify-email?token=${token}`;

    await this.send(email, 'verification email', {
      subject: 'Verify your LinkedOut email address',
      html: `<p>Confirm your email address to finish setting up your LinkedOut account.</p><p><a href="${link}">Verify email</a></p><p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`,
      text: `Confirm your email address to finish setting up your LinkedOut account: ${link}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`,
      logLink: link,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `${this.webOrigin}/reset-password?token=${token}`;

    await this.send(email, 'password reset email', {
      subject: 'Reset your LinkedOut password',
      html: `<p>We received a request to reset the password for this LinkedOut account.</p><p><a href="${link}">Reset password</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email -- your password won't change.</p>`,
      text: `We received a request to reset the password for this LinkedOut account: ${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email -- your password won't change.`,
      logLink: link,
    });
  }

  private async send(
    email: string,
    kind: string,
    content: { subject: string; html: string; text: string; logLink: string },
  ): Promise<void> {
    if (!this.resend) {
      this.logger.log(`${kind[0]!.toUpperCase()}${kind.slice(1)} for ${email}: ${content.logLink}`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    if (error) {
      // Never let a mailer outage fail the caller (registration, login,
      // forgot-password) -- log and move on, same as the dev-mode path.
      this.logger.error(`Failed to send ${kind} to ${email}: ${error.message}`);
    }
  }
}
