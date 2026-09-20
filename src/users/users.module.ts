import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from './user.entity.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthProvider } from './auth.provider.js';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { StringValue } from 'ms';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
          },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './images',
        filename: (_req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  exports: [UsersService, AuthProvider],
})
export class UsersModule {}
