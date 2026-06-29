import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {

    return this.prisma.user.create({
      data,
    });

  }

}