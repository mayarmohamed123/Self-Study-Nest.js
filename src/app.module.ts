import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
@Module({
  imports: [ProductsModule, UsersModule, ReviewsModule],
})
export class AppModule {}
