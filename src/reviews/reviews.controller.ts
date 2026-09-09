import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  public createNewReview(@Body() body: CreateReviewDto) {
    return this.reviewsService.createReview(body);
  }

  @Get()
  public getAllReviews(@Query('productId') productId?: string) {
    if (productId) {
      return this.reviewsService.getByProductId(Number(productId));
    }
    return this.reviewsService.getAll();
  }

  @Get(':id')
  public getSingleReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOneBy(id);
  }

  @Put(':id')
  public updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, body);
  }

  @Delete(':id')
  public deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }
}
