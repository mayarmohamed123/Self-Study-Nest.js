import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto.js';
import { UpdateReviewDto } from './dtos/update-review.dto.js';

export type ReviewType = {
  id: number;
  rating: number;
  comment: string;
  productId: number;
  userId?: number;
  createdAt: Date;
};

@Injectable()
export class ReviewsService {
  private reviews: ReviewType[] = [];

  public createReview(createReviewDto: CreateReviewDto): ReviewType {
    const newReview: ReviewType = {
      id: this.reviews.length > 0 ? Math.max(...this.reviews.map((r) => r.id)) + 1 : 1,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      productId: createReviewDto.productId,
      userId: createReviewDto.userId,
      createdAt: new Date(),
    };
    this.reviews.push(newReview);

    return newReview;
  }

  public getAll(): ReviewType[] {
    return this.reviews;
  }

  public getByProductId(productId: number): ReviewType[] {
    return this.reviews.filter((review) => review.productId === productId);
  }

  public getOneBy(id: number): ReviewType {
    const review = this.reviews.find((review) => review.id === id);
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  public updateReview(id: number, updateReviewDto: UpdateReviewDto): ReviewType {
    const review = this.getOneBy(id);

    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }
    if (updateReviewDto.comment !== undefined) {
      review.comment = updateReviewDto.comment;
    }

    return review;
  }

  public deleteReview(id: number): { message: string } {
    const index = this.reviews.findIndex((review) => review.id === id);
    if (index === -1) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    this.reviews.splice(index, 1);
    return { message: `Review with id ${id} deleted successfully` };
  }
}
