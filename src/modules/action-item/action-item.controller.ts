import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';

import { ActionItemService } from './action-item.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Action Items')
@ApiBearerAuth()
@Controller('action-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionItemController {
  constructor(private readonly actionItemService: ActionItemService) {}

  @Post('extract/:transcriptId')
  @Roles(UserRole.ADMIN)
  async extract(@Param('transcriptId') transcriptId: string) {
    return this.actionItemService.extract(Number(transcriptId));
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.actionItemService.getStats();
  }

  @Get('my')
  async findMyActionItems(@CurrentUser() user: User) {
    return this.actionItemService.findForUser(user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.actionItemService.findAll();
  }

  @Get('meeting/:meetingId')
  async findByMeeting(
    @Param('meetingId') meetingId: string,
    @CurrentUser() user: User,
  ) {
    return this.actionItemService.findByMeeting(Number(meetingId), user);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.actionItemService.updateStatus(Number(id), dto.status, user);
  }
}
