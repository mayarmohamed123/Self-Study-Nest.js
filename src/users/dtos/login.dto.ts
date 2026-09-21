import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Password of the user',
  })
  @IsNotEmpty()
  @Length(6, 50)
  password: string;
}
