import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GraphMeetingService } from './graph-meeting.service';
import { GraphService } from './graph.service';

@Module({
  imports: [ConfigModule],
  providers: [GraphService, GraphMeetingService],
  exports: [GraphService, GraphMeetingService],
})
export class GraphModule {}
