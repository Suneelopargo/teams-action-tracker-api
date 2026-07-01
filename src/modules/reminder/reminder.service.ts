import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron('* * * * *')
  async sendDailyReminders() {
    console.log('Running Reminder Job...');

    const twoDaysAgo = new Date();

    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const actionItems = await this.prisma.actionItem.findMany({
      where: {
        assignedToUserId: {
          not: null,
        },
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
        reminderSent: {
          lt: 4,
        },
        OR: [
          {
            lastReminder: null,
          },
          {
            lastReminder: {
              lte: twoDaysAgo,
            },
          },
        ],
      },
      include: {
        assignedUser: true,
        meeting: true,
      },
    });

    console.log(`Found ${actionItems.length} assigned action items`);

    for (const item of actionItems) {
      const recipientEmail = item.assignedUser?.email ?? item.ownerEmail;

      try {
        if (!recipientEmail) {
          console.log(
            `Skipping ActionItem ${item.id} because assigned user email is missing`,
          );
          continue;
        }

        const reminderNumber = item.reminderSent + 1;
        const subject = `Reminder #${reminderNumber}: Action Item Pending`;
        const body = this.generateReminderBody(
          item.assignedUser?.name ?? item.ownerName ?? 'there',
          reminderNumber,
          item.actionText ?? item.description ?? '',
          item.priority ?? 'MEDIUM',
          item.dueDate,
          item.meeting?.title || 'Meeting',
        );

        await this.emailService.sendEmail(recipientEmail, subject, body);

        await this.prisma.emailLog.create({
          data: {
            actionItemId: item.id,
            emailTo: recipientEmail,
            subject,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        await this.prisma.actionItem.update({
          where: {
            id: item.id,
          },
          data: {
            lastReminder: new Date(),
            reminderSent: {
              increment: 1,
            },
          },
        });

        console.log(`Reminder #${reminderNumber} sent to ${recipientEmail}`);
      } catch (error) {
        console.error(
          `Failed sending reminder for ActionItem ${item.id}`,
          error,
        );

        try {
          await this.prisma.emailLog.create({
            data: {
              actionItemId: item.id,
              emailTo: recipientEmail || 'UNKNOWN',
              subject: `Reminder #${item.reminderSent + 1}: Action Item Pending`,
              status: 'FAILED',
            },
          });
        } catch (logError) {
          console.error('Failed to create EmailLog entry', logError);
        }
      }
    }
  }

  private generateReminderBody(
    ownerName: string,
    reminderNumber: number,
    actionText: string,
    priority: string,
    dueDate: Date | null,
    meetingTitle: string,
  ) {
    return `Hi ${ownerName},

This is reminder #${reminderNumber} for your pending action item from "${meetingTitle}".

Action Item:
${actionText}

Priority:
${priority}

Due Date:
${dueDate ? dueDate.toDateString() : 'Not Assigned'}

Please update the status.

Thanks,
Teams Action Tracker
`;
  }
}
