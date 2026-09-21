import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating of the product from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    example: 'Outstanding quality and very fast shipping! Highly recommended.',
    description: 'Review text/comment (minimum 2 characters)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  comment: string;
}
