import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the user requesting password reset',
  })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'd9b734892c908f5a1e27a6fbc34d89a71092e456',
    description: 'Cryptographically generated reset token from email link',
  })
  @IsNotEmpty()
  @IsString()
  resetPasswordToken: string;

  @ApiProperty({
    example: 'NewSecret123!',
    description: 'New password to set for the account (6 to 50 characters)',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}
