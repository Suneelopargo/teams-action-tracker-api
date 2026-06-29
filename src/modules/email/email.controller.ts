import {
  Controller,
  Get,
  Post,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Get('preview/:actionItemId')
  async preview(
    @Param('actionItemId')
    actionItemId: string,
  ) {
    const actionItem =
      await this.prisma.actionItem.findUnique({
        where: {
          id: Number(actionItemId),
        },
      });

    if (!actionItem) {
      throw new NotFoundException(
        'Action Item not found',
      );
    }

    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: actionItem.meetingId,
        },
      });

    return this.emailService.generateEmail(
      actionItem.ownerName ?? '',
      actionItem.actionText ?? '',
      actionItem.priority ?? '',
      meeting?.title || 'Meeting',
    );
  }

  @Post('send/:actionItemId')
  async sendEmail(
    @Param('actionItemId')
    actionItemId: string,
  ) {
    const actionItem =
      await this.prisma.actionItem.findUnique({
        where: {
          id: Number(actionItemId),
        },
      });

    if (!actionItem) {
      throw new NotFoundException(
        'Action Item not found',
      );
    }

    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: actionItem.meetingId,
        },
      });

    const email =
      this.emailService.generateEmail(
        actionItem.ownerName ?? '',
        actionItem.actionText ?? '',
        actionItem.priority ?? '',
        meeting?.title || 'Meeting',
      );

    const recipientEmail =
      actionItem.ownerEmail;

    if (!recipientEmail) {
      throw new NotFoundException(
        'Owner email not found',
      );
    }

    await this.emailService.sendEmail(
      recipientEmail,
      email.subject,
      email.body,
    );

    return {
      success: true,
      message: `Email sent to ${recipientEmail}`,
    };
  }

  @Get('logs')
async getLogs() {
  return this.prisma.emailLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}
}