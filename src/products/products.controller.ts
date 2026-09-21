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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateProductDto } from './dtos/create-product.dto.js';
import { UpdateProductDto } from './dtos/update-product.dto.js';
import { ProductsService } from './products.service.js';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard.js';
import { Roles } from '../users/decorators/user-roles.decorator.js';
import { UserType } from '../utils/enums.js';
import { CurrentUser } from '../users/decorators/current-user.decorator.js';
import { jwtPayload } from '../utils/types.js';

/**
 * Controller handling product creation, listing, retrieval, updates, and deletion.
 */
@ApiTags('Products')
@Controller('api/products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product (Admin only).
   */
  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public createNewProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.productsService.createProduct(body, payload);
  }

  /**
   * Get all products with optional filters for title, minimum price, and maximum price.
   */
  @Get()
  @ApiOperation({ summary: 'Get all products with optional filtering' })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter products by title (case-insensitive substring match)',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Filter products with price greater than or equal to this value',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Filter products with price less than or equal to this value',
  })
  @ApiResponse({ status: 200, description: 'List of matching products.' })
  public getAllProducts(
    @Query('title') title?: string,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
  ) {
    return this.productsService.getAll(title, minPrice, maxPrice);
  }

  /**
   * Get a single product by its ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Product details returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  public getSingleProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }

  /**
   * Fully update a product by its ID (Admin only).
   */
  @Put(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  /**
   * Partially update a product by its ID (Admin only).
   */
  @Patch(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Partially update a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  /**
   * Delete a product by its ID (Admin only).
   */
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
