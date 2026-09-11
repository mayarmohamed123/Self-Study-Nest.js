import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity.js';
@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Admin@123',
      database: 'nestjs-app-db',
      synchronize: true,
      entities: [Product],
    }),
  ],
})
export class AppModule {}
