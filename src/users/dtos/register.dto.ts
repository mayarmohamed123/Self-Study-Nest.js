import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Length,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @IsNotEmpty()
  @Length(6, 50)
  password: string;

  @IsOptional()
  @Length(2, 120)
  username?: string;
}
