import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address of the account',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;
}
