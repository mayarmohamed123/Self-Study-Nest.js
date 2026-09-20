import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { MailService } from './mail.service.js';
import path from 'node:path';
import fs from 'node:fs';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const templatesDir = fs.existsSync(
          path.join(import.meta.dirname, 'templates'),
        )
          ? path.join(import.meta.dirname, 'templates')
          : path.join(process.cwd(), 'src', 'mail', 'templates');

        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port: config.get<number>('SMTP_PORT'),
            secure: false,
            auth: {
              user: config.get<string>('SMTP_USERNAME'),
              pass: config.get<string>('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: '"NestJS App" <no-reply@nestapp.com>',
          },
          template: {
            dir: templatesDir,
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
