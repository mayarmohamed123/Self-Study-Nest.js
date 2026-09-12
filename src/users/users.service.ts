import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { RegisterDto } from './dtos/register.dto.js';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from '../utils/types.js';

export type UserType = {
  id: number;
  name: string;
  email: string;
  password?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('User Already Exists!');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      name: username,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const accessToken = await this.generateJwtToken({
      id: newUser.id,
      userType: newUser.userType,
    });

    return {
      message: 'User registered successfully',
      accessToken,
      user: newUser,
    };
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found!');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid password!');

    const accessToken = await this.generateJwtToken({
      id: user.id,
      userType: user.userType,
    });

    return { message: 'Login successful', accessToken, user };
  }

  private generateJwtToken(payload: jwtPayload) : Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
