import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.meeting.findMany({
      include: {
        participants: true,
        actionItems: true,
      },
    });
  }
}