import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';



@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user =
      await this.userService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatched =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordMatched) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken:
        await this.jwtService.signAsync(
          payload,
        ),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {

    const existingUser =
      await this.userService.findByEmail(
        dto.email,
      );

    if (existingUser) {

      throw new ConflictException(
        'Email already exists',
      );

    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      await this.userService.createUser({

        name: dto.name,

        email: dto.email,

        password: hashedPassword,

        role: dto.role,

      });

    return {

      message:
        'User registered successfully',

      user: {

        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

      },

    };

}
}