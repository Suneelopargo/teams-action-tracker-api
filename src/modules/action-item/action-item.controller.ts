import {
  Controller,
  Post,
  Get,
  Param,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { ActionItemService } from './action-item.service';

@ApiTags('Action Items')
@Controller('action-items')
export class ActionItemController {

  constructor(
    private readonly actionItemService: ActionItemService,
  ) {}

  @Post('extract/:transcriptId')
  async extract(
    @Param('transcriptId')
    transcriptId: string,
  ) {
    return this.actionItemService.extract(
      Number(transcriptId),
    );
  }

  @Get()
  async findAll() {
    return this.actionItemService.findAll();
  }

  @Get('meeting/:meetingId')
  async findByMeeting(
    @Param('meetingId')
    meetingId: string,
  ) {
    return this.actionItemService.findByMeeting(
      Number(meetingId),
    );
  }
}