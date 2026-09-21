import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Wireless Noise-Canceling Headphones',
    description: 'Title of the product',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
    description: 'Detailed description of the product',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 199.99,
    description: 'Price of the product',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
