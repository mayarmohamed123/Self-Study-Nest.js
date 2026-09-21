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
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller(['api/users', 'api/user'])
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  public registerUser(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  public loginUser(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Get('verify-email/:id/:verificationToken')
  public verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyEmail(id, verificationToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.forgotPassword(body);
  }

  @Get('reset-password/:userId/:resetPasswordToken')
  public validateResetPasswordToken(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.usersService.validateResetPasswordToken(
      userId,
      resetPasswordToken,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }

  @Get('auth/profile')
  @UseGuards(AuthGuard)
  public getProfile(@CurrentUser() payload: jwtPayload) {
    return this.usersService.getProfile(payload.id);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  // ─── Profile Image Endpoints ──────────────────────────────────────────────

  /**
   * POST api/users/profile-image
   * Authenticated: requires Bearer JWT token.
   * Accepts a single file under the field name "file".
   * Stores the file in ./images and saves the filename to the DB.
   * Replaces any existing profile image (old file is deleted from disk).
   */
  @Post('profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
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
   * DELETE api/users/profile-image
   * Authenticated: requires Bearer JWT token.
   * Deletes the current user's profile image from disk and sets profileImg to null.
   */
  @Delete('profile-image')
  @UseGuards(AuthGuard)
  public async deleteProfileImage(@CurrentUser() payload: jwtPayload) {
    return this.usersService.deleteProfileImg(payload.id);
  }

  /**
   * GET api/users/profile-image/:id
   * Public endpoint.
   * Returns the actual image file for the given user ID.
   */
  @Get('profile-image/:id')
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
