import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';

export type ProductType = {
  id: number;
  name: string;
  price: number;
};

@Injectable()
export class ProductsService {
  private products: ProductType[] = [];

  public createProduct(createProductDto: CreateProductDto): ProductType {
    const newProduct: ProductType = {
      id: this.products.length > 0 ? Math.max(...this.products.map((p) => p.id)) + 1 : 1,
      name: createProductDto.name,
      price: createProductDto.price,
    };
    this.products.push(newProduct);

    return newProduct;
  }

  public getAll(): ProductType[] {
    return this.products;
  }

  public getOneBy(id: number): ProductType {
    const product = this.products.find((product) => product.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  public updateProduct(id: number, updateProductDto: UpdateProductDto): ProductType {
    const product = this.getOneBy(id);

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }

    return product;
  }

  public deleteProduct(id: number): { message: string } {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    this.products.splice(index, 1);
    return { message: `Product with id ${id} deleted successfully` };
  }
}
