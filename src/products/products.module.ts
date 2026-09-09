import { Module } from '@nestjs/common';
import { ProductController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [ProductController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
