import { Module } from '@nestjs/common';

import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

@Module({
  providers: [MeetingService],
  controllers: [MeetingController],
})
export class MeetingModule {}
