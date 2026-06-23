import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@ApiTags('Meetings')
@Controller('meetings')
export class MeetingController {

  constructor(
    private readonly meetingService: MeetingService,
  ) {}

  @Get()
  getMeetings() {
    return this.meetingService.findAll();
  }

  @Post()
  createMeeting(
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingService.create(dto);
  }
}