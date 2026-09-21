import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 4,
    description: 'Updated rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    example: 'Updated feedback: Still satisfied after a month of use.',
    description: 'Updated review comment (minimum 2 characters)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  comment?: string;
}
