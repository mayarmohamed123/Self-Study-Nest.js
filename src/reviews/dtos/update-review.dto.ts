import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  comment?: string;
}
