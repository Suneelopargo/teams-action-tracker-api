import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRole } from '@prisma/client';

import { UserService } from './user.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')

@ApiBearerAuth()

@Controller('users')

@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()

  @Roles(UserRole.ADMIN)

  getUsers() {

    return this.userService.getAllUsers();

  }

}