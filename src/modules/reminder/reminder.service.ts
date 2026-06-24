import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  // Testing: every minute
  @Cron('0 9 * * *')

  // Production:
  // @Cron('0 9 * * *')
  async sendDailyReminders() {
    console.log('Running Reminder Job...');

    const twoDaysAgo = new Date();

    twoDaysAgo.setDate(
      twoDaysAgo.getDate() - 2,
    );

    const actionItems =
      await this.prisma.actionItem.findMany({
        where: {
          status: {
            in: [
              'OPEN',
              'IN_PROGRESS',
            ],
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
      });

    console.log(
      `Found ${actionItems.length} action items`,
    );

    for (const item of actionItems) {
      try {
        if (!item.ownerEmail) {
          console.log(
            `Skipping ActionItem ${item.id} because ownerEmail is missing`,
          );
          continue;
        }

        const reminderNumber =
          item.reminderSent + 1;

        const subject =
          `Reminder #${reminderNumber}: Action Item Pending`;

        const body = `
Hi ${item.ownerName},

This is reminder #${reminderNumber} for your pending action item.

Action Item:
${item.actionText}

Priority:
${item.priority}

Due Date:
${item.dueDate
            ? item.dueDate.toDateString()
            : 'Not Assigned'
          }

Please update the status.

Thanks,
Teams Action Tracker
`;

        // Send Email
        await this.emailService.sendEmail(
          item.ownerEmail,
          subject,
          body,
        );

        // Log Success
        await this.prisma.emailLog.create({
          data: {
            actionItemId: item.id,
            emailTo: item.ownerEmail,
            subject,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        // Update Reminder Tracking
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

        console.log(
          `Reminder #${reminderNumber} sent to ${item.ownerEmail}`,
        );
      } catch (error) {
        console.error(
          `Failed sending reminder for ActionItem ${item.id}`,
          error,
        );

        try {
          await this.prisma.emailLog.create({
            data: {
              actionItemId: item.id,
              emailTo:
                item.ownerEmail || 'UNKNOWN',
              subject:
                `Reminder #${item.reminderSent + 1
                }: Action Item Pending`,
              status: 'FAILED',
            },
          });
        } catch (logError) {
          console.error(
            'Failed to create EmailLog entry',
            logError,
          );
        }
      }
    }
  }
}