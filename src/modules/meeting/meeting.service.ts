import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User) {
    return this.prisma.meeting.findMany({
      where: this.meetingAccessWhere(user),
      include: {
        participants: true,
        actionItems: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });
  }

  async create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        title: dto.title,
        meetingDate: new Date(dto.meetingDate),
      },
    });
  }

  private meetingAccessWhere(user: User): Prisma.MeetingWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    return {
      participants: {
        some: {
          OR: [
            {
              userId: user.id,
            },
            {
              email: user.email,
            },
          ],
        },
      },
    };
  }
}
