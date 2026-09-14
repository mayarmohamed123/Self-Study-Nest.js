import { IsOptional, Length, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  username?: string;

  @IsOptional()
  @IsString()
  @Length(6, 50)
  password?: string;
}
