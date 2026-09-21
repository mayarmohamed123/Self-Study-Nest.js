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
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { ReviewsService } from './reviews.service.js';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard.js';
import { Roles } from '../users/decorators/user-roles.decorator.js';
import { UserType } from '../utils/enums.js';
import { CurrentUser } from '../users/decorators/current-user.decorator.js';
import { jwtPayload } from '../utils/types.js';

/**
 * Controller handling reviews for products (creation, listing, updating, deletion).
 */
@ApiTags('Reviews')
@Controller('api/reviews')
@UseInterceptors(ClassSerializerInterceptor)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review for a product (Authenticated user).
   */
  @Post(':productId')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a review for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID', example: 1 })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  public createNewReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.createReview(productId, body, payload);
  }

  /**
   * Get all reviews with pagination (Admin only).
   */
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get all reviews paginated (Admin only)' })
  @ApiQuery({
    name: 'pageNumber',
    description: 'Page number for pagination (starts at 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'reviewsPerPage',
    description: 'Number of reviews per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'List of reviews returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public getAllReviews(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('reviewsPerPage', ParseIntPipe) reviewsPerPage: number,
  ) {
    return this.reviewsService.getAll(pageNumber, reviewsPerPage);
  }

  /**
   * Get a single review by its ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Review details returned.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  public getSingleReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOneBy(id);
  }

  /**
   * Fully update a review by ID (Owner or Admin).
   */
  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a review (Owner or Admin)' })
  @ApiParam({ name: 'id', description: 'Review ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not owner or admin.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  public updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.updateReview(id, body, payload);
  }

  /**
   * Partially update a review by ID (Owner or Admin).
   */
  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Partially update a review (Owner or Admin)' })
  @ApiParam({ name: 'id', description: 'Review ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not owner or admin.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  public patchReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.updateReview(id, body, payload);
  }

  /**
   * Delete a review by ID (Owner or Admin).
   */
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a review (Owner or Admin)' })
  @ApiParam({ name: 'id', description: 'Review ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not owner or admin.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  public deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.deleteReview(id, payload);
  }
}
