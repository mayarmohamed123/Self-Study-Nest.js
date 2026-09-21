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
import { ForgotPasswordDto } from './dtos/forgot-password.dto.js';
import { ResetPasswordDto } from './dtos/reset-password.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';
import { AuthProvider } from './auth.provider.js';
import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Service orchestrating user entity operations, delegating authentication,
 * email verification, and password reset flows to AuthProvider.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}

  /**
   * Registers a new user account with hashed password and verification token.
   * @param registerDto - User registration details (email, password, optional username).
   */
  public register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  /**
   * Authenticates a user, verifying email status and credentials.
   * @param loginDto - User credentials (email, password).
   */
  public login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  /**
   * Verifies a user's email address by checking the verification token against the DB.
   * Clears the verificationToken on success.
   * @param userId - ID of the user to verify.
   * @param verificationToken - Token string received in the verification email.
   */
  public async verifyEmail(
    userId: number,
    verificationToken: string,
  ): Promise<{ message: string }> {
    const user = await this.getProfile(userId);

    if (!user.verificationToken) {
      throw new BadRequestException('Invalid or expired verification token!');
    }

    if (user.verificationToken !== verificationToken) {
      throw new BadRequestException('Invalid verification token!');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Your email has been verified successfully.' };
  }

  /**
   * Handles forgot-password requests by generating a secure token and sending a reset link.
   * @param forgotPasswordDto - Object containing the registered email address.
   */
  public forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.authProvider.forgotPassword(forgotPasswordDto);
  }

  /**
   * Validates whether a reset password token is valid for a given user ID without altering state.
   * @param userId - ID of the user.
   * @param resetPasswordToken - Token from the reset email link.
   */
  public validateResetPasswordToken(
    userId: number,
    resetPasswordToken: string,
  ) {
    return this.authProvider.validateResetPasswordToken(
      userId,
      resetPasswordToken,
    );
  }

  /**
   * Resets the user's password using the validated token and clears the reset token.
   * @param resetPasswordDto - Contains userId, resetPasswordToken, and new password.
   */
  public resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.authProvider.resetPassword(resetPasswordDto);
  }

  /**
   * Retrieves the profile of a user by ID.
   * @throws NotFoundException if user does not exist.
   */
  public async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  /**
   * Retrieves all registered users in the database (Admin only).
   */
  public getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Updates user profile fields (username and/or password).
   */
  public async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
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

  /**
   * Deletes a user record from the database.
   */
  public async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.getProfile(id);
    await this.userRepository.remove(user);

    return { message: `User with id ${id} deleted successfully` };
  }

  /**
   * Saves a new profile image filename for the user.
   * Deletes the old image file from disk if one exists.
   * @param userId - ID of the user.
   * @param newProfileImg - New filename stored in ./images.
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
   * @param userId - ID of the user.
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

  /**
   * Helper: deletes a file from the images folder, ignoring missing-file errors.
   */
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
