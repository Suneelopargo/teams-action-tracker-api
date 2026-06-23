import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';

@ApiTags('Meetings')
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get()
  async getMeetings() {
    return this.meetingService.findAll();
  }
}