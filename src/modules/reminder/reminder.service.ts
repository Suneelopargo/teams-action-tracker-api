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

    type ReminderItem = (typeof actionItems)[number];
    const itemsByRecipient = new Map<string, ReminderItem[]>();

    for (const item of actionItems) {
      const recipientEmail = item.assignedUser?.email ?? item.ownerEmail;

      if (!recipientEmail) {
        console.log(
          `Skipping ActionItem ${item.id} because assigned user email is missing`,
        );
        continue;
      }

      const groupedItems = itemsByRecipient.get(recipientEmail) ?? [];

      groupedItems.push(item);
      itemsByRecipient.set(recipientEmail, groupedItems);
    }

    for (const [recipientEmail, recipientItems] of itemsByRecipient.entries()) {
      try {
        const ownerName =
          recipientItems[0].assignedUser?.name ??
          recipientItems[0].ownerName ??
          'there';
        const subject = this.generateReminderSubject(recipientItems.length);
        const body = this.generateReminderBody(ownerName, recipientItems);
        const htmlBody = this.generateReminderHtmlBody(ownerName, recipientItems);

        await this.emailService.sendEmail(
          recipientEmail,
          subject,
          body,
          htmlBody,
        );

        for (const item of recipientItems) {
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
        }

        console.log(
          `Consolidated reminder sent to ${recipientEmail} for ${recipientItems.length} action item(s)`,
        );
      } catch (error) {
        console.error(
          `Failed sending consolidated reminder to ${recipientEmail}`,
          error,
        );

        for (const item of recipientItems) {
          try {
            await this.prisma.emailLog.create({
              data: {
                actionItemId: item.id,
                emailTo: recipientEmail,
                subject: this.generateReminderSubject(recipientItems.length),
                status: 'FAILED',
              },
            });
          } catch (logError) {
            console.error('Failed to create EmailLog entry', logError);
          }
        }
      }
    }
  }

  private generateReminderSubject(itemCount: number) {
    const itemLabel = itemCount === 1 ? 'Action Item' : 'Action Items';

    return `Reminder: ${itemCount} Pending ${itemLabel}`;
  }

  private generateReminderBody(
    ownerName: string,
    actionItems: Array<{
      actionText: string | null;
      description: string | null;
      priority: string | null;
      dueDate: Date | null;
      meeting: {
        title: string;
      } | null;
      reminderSent: number;
    }>,
  ) {
    const itemLabel = actionItems.length === 1 ? 'item' : 'items';
    const lines = actionItems.map((item, index) => {
      const reminderNumber = item.reminderSent + 1;
      const actionText = item.actionText ?? item.description ?? 'No description';

      return [
        `${index + 1}. ${actionText}`,
        `   Meeting: ${item.meeting?.title || 'Meeting'}`,
        `   Priority: ${item.priority ?? 'MEDIUM'}`,
        `   Due Date: ${this.formatDueDate(item.dueDate)}`,
        `   Reminder: #${reminderNumber}`,
      ].join('\n');
    });

    return `Hi ${ownerName},

You have ${actionItems.length} pending action ${itemLabel}:

${lines.join('\n\n')}

Please update the status.

Thanks,
Teams Action Tracker
`;
  }

  private generateReminderHtmlBody(
    ownerName: string,
    actionItems: Array<{
      actionText: string | null;
      description: string | null;
      priority: string | null;
      dueDate: Date | null;
      meeting: {
        title: string;
      } | null;
      reminderSent: number;
    }>,
  ) {
    const itemLabel = actionItems.length === 1 ? 'item' : 'items';
    const rows = actionItems
      .map((item, index) => {
        const reminderNumber = item.reminderSent + 1;
        const actionText = this.escapeHtml(
          item.actionText ?? item.description ?? 'No description',
        );
        const meetingTitle = this.escapeHtml(item.meeting?.title || 'Meeting');
        const priority = this.escapeHtml(item.priority ?? 'MEDIUM');
        const dueDate = this.escapeHtml(this.formatDueDate(item.dueDate));

        return `
          <tr>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">${index + 1}</td>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">${actionText}</td>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">${meetingTitle}</td>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">${priority}</td>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">${dueDate}</td>
            <td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;">#${reminderNumber}</td>
          </tr>
        `;
      })
      .join('');

    return `
<div style="font-family:Segoe UI, Arial, sans-serif;line-height:1.4;color:#111827;">
  <p>Hi ${this.escapeHtml(ownerName)},</p>
  <p>You have <strong>${actionItems.length}</strong> pending action ${itemLabel}:</p>
  <table style="border-collapse:collapse;width:100%;max-width:900px;">
    <thead>
      <tr style="background-color:#f3f4f6;">
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">#</th>
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">Action Item</th>
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">Meeting</th>
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">Priority</th>
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">Due Date</th>
        <th style="padding:10px;border:1px solid #d1d5db;text-align:left;">Reminder</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <p style="margin-top:16px;">Please update the status.</p>
  <p style="margin-top:16px;">Thanks,<br />Teams Action Tracker</p>
</div>
`;
  }

  private formatDueDate(dueDate: Date | null) {
    if (!dueDate) {
      return 'Not Assigned';
    }

    return dueDate.toDateString();
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
