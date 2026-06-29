import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiService } from '../openai/openai.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ActionItemService {
  constructor(
    private prisma: PrismaService,
    private openAiService: OpenAiService,
    private emailService: EmailService,
  ) {}

  async extract(transcriptId: number) {
    const transcript = await this.prisma.transcript.findUnique({
      where: {
        id: transcriptId,
      },
    });

    if (!transcript) {
      throw new NotFoundException('Transcript not found');
    }

    const meeting = await this.prisma.meeting.findUnique({
      where: {
        id: transcript.meetingId,
      },
    });

    const aiResponse = await this.openAiService.extractActionItems(
      transcript.transcriptText,
    );

    let actionItems: any[] = [];

    try {
      const parsedResponse = JSON.parse(aiResponse);

      actionItems = parsedResponse.actionItems || [];
    } catch (error) {
      console.error('Failed to parse AI response:', aiResponse);

      throw new Error('Unable to parse AI response');
    }

    const savedActionItems: any[] = [];

    for (const item of actionItems) {
      const participant = await this.findOwnerParticipant(
        transcript.meetingId,
        item.ownerName,
        item.ownerEmail,
      );

      const assignedUser = await this.findAssignedUser(
        participant?.userId,
        participant?.email ?? item.ownerEmail,
      );

      const ownerName = item.ownerName || participant?.name || 'Unknown';

      const ownerEmail = participant?.email ?? item.ownerEmail ?? null;

      const actionText = item.actionText || '';

      const savedActionItem = await this.prisma.actionItem.create({
        data: {
          meetingId: transcript.meetingId,
          ownerName,
          ownerEmail,
          actionText,
          dueDate: this.parseDueDate(item.dueDate),
          title: item.title || this.buildTitle(actionText),
          description: item.description || actionText || null,
          assignedToUserId: assignedUser?.id ?? null,
          priority: this.normalizePriority(item.priority),
          status: 'OPEN',
          lastReminder: new Date(),
          reminderSent: 0,
        },
      });

      savedActionItems.push(savedActionItem);

      if (ownerEmail) {
        try {
          const email = this.emailService.generateEmail(
            savedActionItem.ownerName ?? '',
            savedActionItem.actionText ?? '',
            savedActionItem.priority ?? '',
            meeting?.title || 'Meeting',
          );

          await this.emailService.sendEmail(
            ownerEmail,
            email.subject,
            email.body,
          );

          await this.prisma.emailLog.create({
            data: {
              actionItemId: savedActionItem.id,
              emailTo: ownerEmail,
              subject: email.subject,
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          console.log(`Assignment email sent to ${ownerEmail}`);
        } catch (error) {
          console.error(
            `Failed sending assignment email to ${ownerEmail}`,
            error,
          );

          await this.prisma.emailLog.create({
            data: {
              actionItemId: savedActionItem.id,
              emailTo: ownerEmail,
              subject: 'Assignment Email',
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
      include: this.actionItemInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findForUser(user: User) {
    return this.prisma.actionItem.findMany({
      where: this.userActionItemWhere(user),
      include: this.actionItemInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByMeeting(meetingId: number, user: User) {
    return this.prisma.actionItem.findMany({
      where: {
        meetingId,
        ...this.userActionItemWhere(user),
      },
      include: this.actionItemInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: number, status: string, user: User) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: {
        id,
      },
    });

    if (!actionItem) {
      throw new NotFoundException('Action Item not found');
    }

    if (!this.canAccessActionItem(actionItem, user)) {
      throw new ForbiddenException(
        'You are not allowed to update this action item',
      );
    }

    return this.prisma.actionItem.update({
      where: {
        id,
      },
      data: {
        status: this.normalizeStatus(status),
      },
    });
  }

  async getStats() {
    const total = await this.prisma.actionItem.count();

    const open = await this.prisma.actionItem.count({
      where: {
        status: 'OPEN',
      },
    });

    const inProgress = await this.prisma.actionItem.count({
      where: {
        status: 'IN_PROGRESS',
      },
    });

    const completed = await this.prisma.actionItem.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const blocked = await this.prisma.actionItem.count({
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

  private async findOwnerParticipant(
    meetingId: number,
    ownerName?: string,
    ownerEmail?: string,
  ) {
    if (ownerEmail) {
      const participantByEmail = await this.prisma.participant.findFirst({
        where: {
          meetingId,
          email: ownerEmail,
        },
      });

      if (participantByEmail) {
        return participantByEmail;
      }
    }

    if (!ownerName) {
      return null;
    }

    return this.prisma.participant.findFirst({
      where: {
        meetingId,
        name: {
          contains: ownerName,
        },
      },
    });
  }

  private async findAssignedUser(
    participantUserId?: number | null,
    ownerEmail?: string | null,
  ) {
    if (participantUserId) {
      return this.prisma.user.findUnique({
        where: {
          id: participantUserId,
        },
      });
    }

    if (!ownerEmail) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: {
        email: ownerEmail,
      },
    });
  }

  private parseDueDate(dueDate?: string | Date | null) {
    if (!dueDate) {
      return null;
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  private buildTitle(actionText?: string | null) {
    if (!actionText) {
      return null;
    }

    return actionText.length > 80
      ? `${actionText.slice(0, 77)}...`
      : actionText;
  }

  private normalizePriority(priority?: string | null) {
    const normalized = priority?.toUpperCase();

    if (
      normalized === 'LOW' ||
      normalized === 'MEDIUM' ||
      normalized === 'HIGH' ||
      normalized === 'CRITICAL'
    ) {
      return normalized;
    }

    return 'MEDIUM';
  }

  private normalizeStatus(status: string) {
    const normalized = status.toUpperCase();

    if (
      normalized === 'OPEN' ||
      normalized === 'IN_PROGRESS' ||
      normalized === 'COMPLETED' ||
      normalized === 'BLOCKED'
    ) {
      return normalized;
    }

    return status;
  }

  private userActionItemWhere(user: User): Prisma.ActionItemWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    return {
      OR: [
        {
          assignedToUserId: user.id,
        },
        {
          ownerEmail: user.email,
        },
      ],
    };
  }

  private canAccessActionItem(
    actionItem: {
      assignedToUserId: number | null;
      ownerEmail: string | null;
    },
    user: User,
  ) {
    return (
      user.role === UserRole.ADMIN ||
      actionItem.assignedToUserId === user.id ||
      actionItem.ownerEmail === user.email
    );
  }

  private actionItemInclude() {
    return {
      meeting: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    };
  }
}
