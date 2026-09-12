import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}
