import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from '../utils/types.js';
import { MailService } from '../mail/mail.service.js';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('User Already Exists!');

    const hashedPassword = await this.hashPassword(password);
    const verificationToken = randomBytes(32).toString('hex');

    const newUser = this.userRepository.create({
      name: username,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await this.userRepository.save(newUser);

    const verificationLink = this.generateVerificationLink(
      newUser.id,
      verificationToken,
    );

    await this.mailService.sendVerifyEmailTemplate(
      newUser.email,
      verificationLink,
    );

    return {
      message:
        'Please verify your email. A verification link has been sent to your email address.',
    };
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found!');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid password!');

    if (!user.isEmailVerified) {
      let token = user.verificationToken;
      if (!token) {
        token = randomBytes(32).toString('hex');
        user.verificationToken = token;
        await this.userRepository.save(user);
      }

      const verificationLink = this.generateVerificationLink(user.id, token);
      await this.mailService.sendVerifyEmailTemplate(
        user.email,
        verificationLink,
      );

      return {
        message:
          'Please verify your email address. A verification link has been sent to your email.',
      };
    }

    const accessToken = await this.generateJWT({
      id: user.id,
      userType: user.userType,
    });

    await this.mailService.sendLoginNotification(user.email, user.name);

    return { message: 'Login successful', accessToken, user };
  }

  private generateVerificationLink(userId: number, token: string): string {
    const domain =
      this.configService.get<string>('DOMAIN') ?? 'http://localhost:5000';
    return `${domain}/api/user/verify-email/${userId}/${token}`;
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async generateJWT(payload: jwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
