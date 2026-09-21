import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

/**
 * Service providing email dispatching capabilities via Nodemailer and @nestjs-modules/mailer.
 * Supports HTML/text emails and EJS templates with automatic CSS inlining.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Dispatches an email message using the configured SMTP transporter.
   * Catches errors to avoid failing main business transactions when transport is unavailable.
   */
  public async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    context?: Record<string, any>;
  }) {
    try {
      return await this.mailerService.sendMail({
        to: options.to,
        from: '"NestJS App" <no-reply@nestapp.com>',
        subject: options.subject,
        text: options.text,
        html: options.html,
        template: options.template,
        context: options.context,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
    }
  }

  /**
   * Helper to send plain or raw HTML email.
   */
  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    return this.sendMail({ to, subject, html, text });
  }

  /**
   * Sends a login notification email informing the user of an account sign-in.
   */
  public async sendLoginNotification(to: string, name?: string) {
    const displayName = name ?? 'User';
    return this.sendMail({
      to,
      subject: 'New Login Detected',
      template: 'login',
      context: {
        name: displayName,
        email: to,
        loginTime: new Date().toLocaleString(),
      },
    });
  }

  /**
   * Sends an email verification template with a link to activate the account.
   */
  public async sendVerifyEmailTemplate(email: string, link: string) {
    return this.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'verify-email',
      context: {
        link,
      },
    });
  }

  /**
   * Sends a password reset template with a link allowing the user to set a new password.
   */
  public async sendResetPasswordTemplate(
    email: string,
    link: string,
    name?: string,
  ) {
    return this.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        link,
        name,
      },
    });
  }
}
