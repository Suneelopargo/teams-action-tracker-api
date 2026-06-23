import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

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

  async create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        title: dto.title,
        meetingDate: new Date(dto.meetingDate),
      },
    });
  }
}