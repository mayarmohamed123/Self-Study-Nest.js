import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';
import { AuthProvider } from './auth.provider.js';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

  /**
   * Saves a new profile image filename for the user.
   * Deletes the old image file from disk if one exists.
   */
  public async setProfileImg(
    userId: number,
    newProfileImg: string,
  ): Promise<User> {
    const user = await this.getProfile(userId);

    // Delete old image file if it exists
    if (user.profileImg) {
      await this.removeImageFile(user.profileImg);
    }

    user.profileImg = newProfileImg;
    return this.userRepository.save(user);
  }

  /**
   * Deletes the user's profile image from disk and sets profileImg to null.
   */
  public async deleteProfileImg(
    userId: number,
  ): Promise<{ message: string }> {
    const user = await this.getProfile(userId);

    if (!user.profileImg) {
      throw new BadRequestException('User does not have a profile image');
    }

    await this.removeImageFile(user.profileImg);
    user.profileImg = null;
    await this.userRepository.save(user);

    return { message: 'Profile image deleted successfully' };
  }

  /** Helper: delete a file from the images folder, ignoring missing-file errors. */
  private async removeImageFile(filename: string): Promise<void> {
    try {
      await unlink(join(process.cwd(), 'images', filename));
    } catch (err: unknown) {
      // File may have already been removed — not a fatal error
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`Failed to delete image file "${filename}":`, err);
      }
    }
  }
}

