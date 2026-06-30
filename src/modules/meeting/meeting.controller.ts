import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingService } from './meeting.service';

@ApiTags('Meetings')
@ApiBearerAuth()
@Controller('meetings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  getMeetings(@CurrentUser() user: User) {
    return this.meetingService.findAll(user);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  createMeeting(@Body() dto: CreateMeetingDto) {
    return this.meetingService.create(dto);
  }
}
