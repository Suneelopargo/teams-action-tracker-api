import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ActionItemService {
  constructor(
    private prisma: PrismaService,
    private openAiService: OpenAiService,
    private emailService: EmailService,
  ) { }

  async extract(transcriptId: number) {
    const transcript =
      await this.prisma.transcript.findUnique({
        where: {
          id: transcriptId,
        },
      });

    if (!transcript) {
      throw new NotFoundException(
        'Transcript not found',
      );
    }

    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: transcript.meetingId,
        },
      });

    const aiResponse =
      await this.openAiService.extractActionItems(
        transcript.transcriptText,
      );

    let actionItems: any[] = [];

    try {
      const parsedResponse =
        JSON.parse(aiResponse);

      actionItems =
        parsedResponse.actionItems || [];
    } catch (error) {
      console.error(
        'Failed to parse AI response:',
        aiResponse,
      );

      throw new Error(
        'Unable to parse AI response',
      );
    }

    const savedActionItems: any[] = [];

    for (const item of actionItems) {
      let ownerEmail: string | null = null;

      const participant =
        await this.prisma.participant.findFirst({
          where: {
            meetingId:
              transcript.meetingId,

            name: {
              contains:
                item.ownerName || '',
            },
          },
        });

      if (participant?.email) {
        ownerEmail =
          participant.email;
      }

      const savedActionItem =
        await this.prisma.actionItem.create({
          data: {
            meetingId:
              transcript.meetingId,

            ownerName:
              item.ownerName || 'Unknown',

            ownerEmail,

            actionText:
              item.actionText || '',

            dueDate:
              // item.dueDate
              //   ? new Date(item.dueDate)
              //   : null,

              item.dueDate
                ? null
                : null,

            priority:
              item.priority || 'MEDIUM',

            status: 'OPEN',

            // Important:
            // prevents reminder email immediately
            lastReminder: new Date(),

            reminderSent: 0,
          },
        });

      savedActionItems.push(
        savedActionItem,
      );

      /*
       * Send assignment email immediately
       */
      if (ownerEmail) {
        try {
          const email =
            this.emailService.generateEmail(
              savedActionItem.ownerName ?? '',
              savedActionItem.actionText ?? '',
              savedActionItem.priority ?? '',
              meeting?.title ||
              'Meeting',
            );

          await this.emailService.sendEmail(
            ownerEmail,
            email.subject,
            email.body,
          );

          await this.prisma.emailLog.create({
            data: {
              actionItemId:
                savedActionItem.id,

              emailTo:
                ownerEmail,

              subject:
                email.subject,

              status: 'SENT',

              sentAt:
                new Date(),
            },
          });

          console.log(
            `Assignment email sent to ${ownerEmail}`,
          );
        } catch (error) {
          console.error(
            `Failed sending assignment email to ${ownerEmail}`,
            error,
          );

          await this.prisma.emailLog.create({
            data: {
              actionItemId:
                savedActionItem.id,

              emailTo:
                ownerEmail,

              subject:
                'Assignment Email',

              status: 'FAILED',
            },
          });
        }
      }
    }

    return savedActionItems;
  }

  async findAll() {
    return this.prisma.actionItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByMeeting(
    meetingId: number,
  ) {
    return this.prisma.actionItem.findMany({
      where: {
        meetingId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: number,
    status: string,
  ) {
    const actionItem =
      await this.prisma.actionItem.findUnique({
        where: {
          id,
        },
      });

    if (!actionItem) {
      throw new NotFoundException(
        'Action Item not found',
      );
    }

    return this.prisma.actionItem.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async getStats() {
    const total =
      await this.prisma.actionItem.count();

    const open =
      await this.prisma.actionItem.count({
        where: {
          status: 'OPEN',
        },
      });

    const inProgress =
      await this.prisma.actionItem.count({
        where: {
          status: 'IN_PROGRESS',
        },
      });

    const completed =
      await this.prisma.actionItem.count({
        where: {
          status: 'COMPLETED',
        },
      });

    const blocked =
      await this.prisma.actionItem.count({
        where: {
          status: 'BLOCKED',
        },
      });

    return {
      total,
      open,
      inProgress,
      completed,
      blocked,
    };
  }
}