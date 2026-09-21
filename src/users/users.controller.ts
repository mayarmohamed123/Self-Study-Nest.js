import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ForgotPasswordDto } from './dtos/forgot-password.dto.js';
import { ResetPasswordDto } from './dtos/reset-password.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { jwtPayload } from '../utils/types.js';
import { UserType } from '../utils/enums.js';
import { Roles } from './decorators/user-roles.decorator.js';
import { AuthRolesGuard } from './guards/auth-roles.guard.js';
import { join } from 'path';
import type { Response } from 'express';

/**
 * Controller handling user authentication, verification, password recovery,
 * profiles, and profile image uploads.
 */
@ApiTags('Users')
@Controller(['api/users'])
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register a new user account.
   * Sends an email verification link to the provided email address.
   */
  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Verification email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already registered.',
  })
  public registerUser(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  /**
   * Authenticate a user with email and password.
   * Returns a JWT access token if email is verified.
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and generate JWT access token' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful (returns accessToken) or prompt to verify email.',
  })
  @ApiResponse({ status: 400, description: 'Invalid password.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public loginUser(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  /**
   * Verify a user's email using the token received in the verification email.
   */
  @Get('verify-email/:id/:verificationToken')
  @ApiOperation({ summary: 'Verify email address via token link' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiParam({
    name: 'verificationToken',
    description: 'Verification token string from email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyEmail(id, verificationToken);
  }

  /**
   * Request a password reset link to be sent to the user's email.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent to email if account exists.',
  })
  @ApiResponse({
    status: 404,
    description: 'User with this email does not exist.',
  })
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.forgotPassword(body);
  }

  /**
   * Validate that a password reset link/token is valid and not expired.
   */
  @Get('reset-password/:userId/:resetPasswordToken')
  @ApiOperation({ summary: 'Validate password reset link token' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiParam({
    name: 'resetPasswordToken',
    description: 'Password reset token from email link',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset password link is valid.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset password token.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public validateResetPasswordToken(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.usersService.validateResetPasswordToken(
      userId,
      resetPasswordToken,
    );
  }

  /**
   * Reset user password using the reset token.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token, or validation error.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }

  /**
   * Get current authenticated user profile.
   */
  @Get('auth/profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid/missing token.' })
  public getProfile(@CurrentUser() payload: jwtPayload) {
    return this.usersService.getProfile(payload.id);
  }

  /**
   * Get all registered users (Admin only).
   */
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Admin role.' })
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Update a user's details (username or password).
   */
  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update user details' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, body);
  }

  /**
   * Delete a user account.
   */
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  // ─── Profile Image Endpoints ──────────────────────────────────────────────

  /**
   * Upload or replace profile image for the authenticated user.
   */
  @Post('profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Upload or replace profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpeg, png, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Profile image uploaded successfully.',
  })
  @ApiResponse({ status: 400, description: 'No image file provided.' })
  public async uploadProfileImage(
    @CurrentUser() payload: jwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const updatedUser = await this.usersService.setProfileImg(
      payload.id,
      file.filename,
    );

    return {
      message: 'Profile image uploaded successfully',
      profileImg: updatedUser.profileImg,
    };
  }

  /**
   * Delete the profile image of the authenticated user.
   */
  @Delete('profile-image')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete current user profile image' })
  @ApiResponse({
    status: 200,
    description: 'Profile image deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not have a profile image.',
  })
  public async deleteProfileImage(@CurrentUser() payload: jwtPayload) {
    return this.usersService.deleteProfileImg(payload.id);
  }

  /**
   * Stream the profile image file for a given user ID (Public).
   */
  @Get('profile-image/:id')
  @ApiOperation({ summary: 'Get profile image file by user ID (Public)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Returns the image file.' })
  @ApiResponse({
    status: 404,
    description: 'User or profile image not found.',
  })
  public async getProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getProfile(id);

    if (!user.profileImg) {
      throw new NotFoundException('User does not have a profile image');
    }

    const imagePath = join(process.cwd(), 'images', user.profileImg);
    res.sendFile(imagePath);
  }
}
