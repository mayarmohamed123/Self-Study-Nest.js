import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';
import { ProductsService } from './products.service.js';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard.js';
import { Roles } from '../users/decorators/user-roles.decorator.js';
import { UserType } from '../utils/enums.js';
import { CurrentUser } from '../users/decorators/current-user.decorator.js';
import { jwtPayload } from '../utils/types.js';

@Controller('api/products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public createNewProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.productsService.createProduct(body, payload);
  }

  @Get()
  public getAllProducts(
    @Query('title') title?: string,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
  ) {
    return this.productsService.getAll(title, minPrice, maxPrice);
  }

  @Get(':id')
  public getSingleProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }

  @Put(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
