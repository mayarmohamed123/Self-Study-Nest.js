import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Updated Wireless Headphones Pro',
    description: 'Updated title of the product',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description with improved battery specifications.',
    description: 'Updated description of the product',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 179.99,
    description: 'Updated price of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  price?: number;
}
