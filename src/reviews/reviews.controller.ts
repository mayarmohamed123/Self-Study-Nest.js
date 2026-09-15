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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { ReviewsService } from './reviews.service.js';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard.js';
import { Roles } from '../users/decorators/user-roles.decorator.js';
import { UserType } from '../utils/enums.js';
import { CurrentUser } from '../users/decorators/current-user.decorator.js';
import { jwtPayload } from '../utils/types.js';

@Controller('api/reviews')
@UseInterceptors(ClassSerializerInterceptor)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public createNewReview(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.createReview(productId, body, payload);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllReviews() {
    return this.reviewsService.getAll();
  }

  @Get(':id')
  public getSingleReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getOneBy(id);
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.updateReview(id, body, payload);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public patchReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.updateReview(id, body, payload);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: jwtPayload,
  ) {
    return this.reviewsService.deleteReview(id, payload);
  }
}
