import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

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

  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    return this.sendMail({ to, subject, html, text });
  }

  public async sendWelcomeEmail(to: string, name?: string) {
    const displayName = name ?? 'User';
    return this.sendMail({
      to,
      subject: 'Welcome to our platform!',
      template: 'welcome',
      context: {
        name: displayName,
        email: to,
      },
    });
  }

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
}
