import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto.js';
import { UpdateUserDto } from './dtos/update-user.dto.js';

export type UserType = {
  id: number;
  name: string;
  email: string;
  password?: string;
};

@Injectable()
export class UsersService {
  private users: UserType[] = [];

  public createUser(createUserDto: CreateUserDto): UserType {
    const existingUser = this.users.find(
      (user) => user.email.toLowerCase() === createUserDto.email.toLowerCase(),
    );
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser: UserType = {
      id: this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1,
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
    };
    this.users.push(newUser);

    return newUser;
  }

  public getAll(): UserType[] {
    return this.users;
  }

  public getOneBy(id: number): UserType {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  public updateUser(id: number, updateUserDto: UpdateUserDto): UserType {
    const user = this.getOneBy(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = this.users.find(
        (u) =>
          u.email.toLowerCase() === updateUserDto.email?.toLowerCase() &&
          u.id !== id,
      );
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.password !== undefined) {
      user.password = updateUserDto.password;
    }

    return user;
  }

  public deleteUser(id: number): { message: string } {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.users.splice(index, 1);
    return { message: `User with id ${id} deleted successfully` };
  }
}
