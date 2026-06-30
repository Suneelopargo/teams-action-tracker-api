import { Module } from '@nestjs/common';

import { ActionItemModule } from '../action-item/action-item.module';
import { TranscriptController } from './transcript.controller';
import { TranscriptService } from './transcript.service';

@Module({
  imports: [ActionItemModule],
  providers: [TranscriptService],
  controllers: [TranscriptController],
})
export class TranscriptModule {}
