import { Module } from '@nestjs/common';
import { GraphModule } from '../graph/graph.module';

import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

@Module({
  imports: [GraphModule],
  providers: [MeetingService],
  controllers: [MeetingController],
})
export class MeetingModule {}
