import { IsOptional, Length, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'new_username',
    description: 'Updated username or full name (2 to 120 characters)',
  })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  username?: string;

  @ApiPropertyOptional({
    example: 'NewSecret123!',
    description: 'Updated password (6 to 50 characters)',
  })
  @IsOptional()
  @IsString()
  @Length(6, 50)
  password?: string;
}
