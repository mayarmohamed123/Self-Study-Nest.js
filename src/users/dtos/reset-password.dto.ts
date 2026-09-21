import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  resetPasswordToken: string;

  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}
