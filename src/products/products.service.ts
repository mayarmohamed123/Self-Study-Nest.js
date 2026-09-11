import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';
import { Product } from './product.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export type ProductType = {
  id: number;
  title: string;
  price: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  public createProduct(dto: CreateProductDto) {
    const newProduct = this.productRepository.create(dto);
    return this.productRepository.save(newProduct);
  }

  public getAll() {
    return this.productRepository.find();
  }

  public async getOneBy(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  public async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.getOneBy(id);

    product.title = updateProductDto.title ?? product.title;
    product.description = updateProductDto.description ?? product.description;
    product.price = updateProductDto.price ?? product.price;

    return this.productRepository.save(product);
  }

  public async deleteProduct(id: number): Promise<{ message: string }> {
    const product = await this.getOneBy(id);
    await this.productRepository.remove(product);
    return { message: `Product with id ${id} deleted successfully` };
  }
}
