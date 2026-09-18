import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';
import { Review } from './review.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service.js';
import { UsersService } from '../users/users.service.js';
import { jwtPayload } from '../utils/types.js';
import { UserType } from '../utils/enums.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  public async createReview(
    productId: number,
    createReviewDto: CreateReviewDto,
    payload: jwtPayload,
  ) {
    const product = await this.productsService.getOneBy(productId);
    const user = await this.usersService.getProfile(payload.id);

    const newReview = this.reviewRepository.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      product,
      user,
    });

    const savedReview = await this.reviewRepository.save(newReview);

    return {
      id: savedReview.id,
      rating: savedReview.rating,
      comment: savedReview.comment,
    };
  }

  public getAll(pageNumber: number, reviewsPerPage: number) {
    return this.reviewRepository.find({
      skip: (pageNumber - 1) * reviewsPerPage,
      take: reviewsPerPage,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
        product: true,
      },
    });
  }

  public async getOneBy(id: number) {
    return this.findReviewById(id);
  }

  public async updateReview(
    id: number,
    updateReviewDto: UpdateReviewDto,
    payload: jwtPayload,
  ) {
    const review = await this.findReviewById(id);

    const isOwner =
      review.userId === payload.id || review.user?.id === payload.id;

    if (!isOwner) {
      throw new ForbiddenException('You are not allowed to update this review');
    }

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    const updated = await this.reviewRepository.save(review);
    return {
      id: updated.id,
      rating: updated.rating,
      comment: updated.comment,
    };
  }

  public async deleteReview(
    id: number,
    payload: jwtPayload,
  ): Promise<{ message: string }> {
    const review = await this.findReviewById(id);

    const isOwner =
      review.userId === payload.id || review.user?.id === payload.id;
    const isAdmin = payload.userType === UserType.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.reviewRepository.remove(review);
    return { message: `Review with id ${id} deleted successfully` };
  }

  private async findReviewById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: true,
      },
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }
}
