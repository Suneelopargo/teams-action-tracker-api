import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EmailService } from './email.service';

@ApiTags('Emails')
@ApiBearerAuth()
@Controller('emails')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EmailController {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Get('preview/:actionItemId')
  async preview(@Param('actionItemId') actionItemId: string) {
    const actionItem = await this.findActionItem(Number(actionItemId));

    return this.emailService.generateEmail(
      actionItem.ownerName ?? '',
      actionItem.actionText ?? actionItem.description ?? '',
      actionItem.priority ?? '',
      actionItem.meeting?.title || 'Meeting',
      actionItem.dueDate,
    );
  }

  @Post('send/:actionItemId')
  async sendEmail(@Param('actionItemId') actionItemId: string) {
    const actionItem = await this.findActionItem(Number(actionItemId));

    const recipientEmail =
      actionItem.ownerEmail ?? actionItem.assignedUser?.email;

    if (!recipientEmail) {
      throw new NotFoundException('Owner email not found');
    }

    const email = this.emailService.generateEmail(
      actionItem.ownerName ?? actionItem.assignedUser?.name ?? '',
      actionItem.actionText ?? actionItem.description ?? '',
      actionItem.priority ?? '',
      actionItem.meeting?.title || 'Meeting',
      actionItem.dueDate,
    );

    try {
      await this.emailService.sendEmail(
        recipientEmail,
        email.subject,
        email.body,
      );

      await this.prisma.emailLog.create({
        data: {
          actionItemId: actionItem.id,
          emailTo: recipientEmail,
          subject: email.subject,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        message: `Email sent to ${recipientEmail}`,
      };
    } catch (error) {
      await this.prisma.emailLog.create({
        data: {
          actionItemId: actionItem.id,
          emailTo: recipientEmail,
          subject: email.subject,
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

  @Get('logs')
  async getLogs() {
    return this.prisma.emailLog.findMany({
      include: {
        actionItem: {
          include: {
            meeting: true,
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async findActionItem(actionItemId: number) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: {
        id: actionItemId,
      },
      include: {
        meeting: true,
        assignedUser: true,
      },
    });

    if (!actionItem) {
      throw new NotFoundException('Action Item not found');
    }

    return actionItem;
  }
}
