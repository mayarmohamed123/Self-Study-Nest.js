import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Password of the user (6 to 50 characters)',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @Length(6, 50)
  password: string;

  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Username or full name (2 to 120 characters)',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @Length(2, 120)
  username?: string;
}
