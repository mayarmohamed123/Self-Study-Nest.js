import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity.js';
import { User } from './users/user.entity.js';
import { Review } from './reviews/review.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadsModule } from './uploads/upload.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
    }),
    ProductsModule,
    UsersModule,
    ReviewsModule,
    UploadsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DB_USERNAME:', config.get('DB_USERNAME'));
        console.log('DB_PASSWORD exists:', !!config.get('DB_PASSWORD'));
        return {
          type: 'postgres',
          host: 'localhost',
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          synchronize: process.env.NODE_ENV !== 'production',
          entities: [Product, User, Review],
        };
      },
    }),
  ],
})
export class AppModule {}
