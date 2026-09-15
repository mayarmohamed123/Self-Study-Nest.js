import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';
import { AuthProvider } from './auth.provider.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  public register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  public login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  public async getProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  public getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.getProfile(id);

    if (updateUserDto.username) {
      user.name = updateUserDto.username;
    }

    if (updateUserDto.password) {
      user.password = await this.authProvider.hashPassword(
        updateUserDto.password,
      );
    }

    return this.userRepository.save(user);
  }

  public async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.getProfile(id);
    await this.userRepository.remove(user);

    return { message: `User with id ${id} deleted successfully` };
  }
}
