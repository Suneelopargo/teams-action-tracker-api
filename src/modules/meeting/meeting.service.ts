import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';

import { GraphMeetingService } from '../graph/graph-meeting.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { SyncGraphMeetingDto } from './dto/sync-graph-meeting.dto';

type GraphParticipant = {
  name: string;
  email: string | null;
};

@Injectable()
export class MeetingService {
  constructor(
    private prisma: PrismaService,
    private readonly graphMeetingService: GraphMeetingService,
  ) {}

  async findAll(user: User) {
    return this.prisma.meeting.findMany({
      where: this.meetingAccessWhere(user),
      include: {
        participants: true,
        actionItems: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });
  }

  async create(dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        title: dto.title,
        meetingDate: new Date(dto.meetingDate),
      },
    });
  }

  async syncFromGraph(dto: SyncGraphMeetingDto) {
    console.log('[MeetingService:syncFromGraph] start', {
      hasGraphMeetingId: Boolean(dto.graphMeetingId),
      hasJoinWebUrl: Boolean(dto.joinWebUrl),
      organizerUserId: dto.organizerUserId,
    });

    if (!dto.graphMeetingId && !dto.joinWebUrl) {
      throw new BadRequestException(
        'Either graphMeetingId or joinWebUrl is required',
      );
    }

    const lookupMode = dto.graphMeetingId
      ? 'meetingId'
      : 'joinWebUrl';

    console.log('[MeetingService:syncFromGraph] lookup mode selected', {
      lookupMode,
      graphMeetingId: dto.graphMeetingId,
      joinWebUrlPreview: dto.joinWebUrl
        ? dto.joinWebUrl.slice(0, 120)
        : undefined,
    });

    const graphMeeting = dto.graphMeetingId
      ? await this.graphMeetingService.getMeetingDetails(
          dto.graphMeetingId,
          dto.organizerUserId,
        )
      : await this.graphMeetingService.getMeetingDetailsByJoinWebUrl(
          dto.joinWebUrl!,
          dto.organizerUserId,
        );

    console.log('[MeetingService:syncFromGraph] graph response received', {
      found: Boolean(graphMeeting),
      graphMeetingId: graphMeeting?.id,
      subject: graphMeeting?.subject,
      startDateTime: graphMeeting?.startDateTime,
    });

    if (!graphMeeting?.id) {
      console.warn('[MeetingService:syncFromGraph] graph meeting not found', {
        lookupMode,
        graphMeetingId: dto.graphMeetingId,
        joinWebUrlPreview: dto.joinWebUrl
          ? dto.joinWebUrl.slice(0, 120)
          : undefined,
      });

      throw new BadRequestException(
        'Meeting not found in Microsoft Graph',
      );
    }

    const participants = this.extractParticipants(
      graphMeeting.participants,
    );

    console.log('[MeetingService:syncFromGraph] participants extracted', {
      count: participants.length,
      sample: participants.slice(0, 3),
    });

    const meetingDate = graphMeeting.startDateTime
      ? new Date(graphMeeting.startDateTime)
      : new Date();

    const title = graphMeeting.subject?.trim() || 'Untitled Graph Meeting';

    const savedMeeting = await this.prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.upsert({
        where: {
          graphMeetingId: graphMeeting.id,
        },
        update: {
          title,
          meetingDate,
          source: 'GRAPH',
        },
        create: {
          graphMeetingId: graphMeeting.id,
          title,
          meetingDate,
          source: 'GRAPH',
        },
      });

      await tx.participant.deleteMany({
        where: {
          meetingId: meeting.id,
        },
      });

      if (participants.length) {
        await tx.participant.createMany({
          data: participants.map((participant) => ({
            meetingId: meeting.id,
            name: participant.name,
            email: participant.email,
          })),
          skipDuplicates: true,
        });
      }

      console.log('[MeetingService:syncFromGraph] db upsert complete', {
        meetingId: meeting.id,
        graphMeetingId: meeting.graphMeetingId,
        participantCount: participants.length,
      });

      return meeting;
    });

    return {
      message: 'Meeting synced from Microsoft Graph',
      meeting: savedMeeting,
      participantCount: participants.length,
    };
  }

  private extractParticipants(graphParticipants: unknown): GraphParticipant[] {
    const participantBuckets = graphParticipants as {
      organizer?: unknown;
      attendees?: unknown[];
    };

    const allParticipants = [
      participantBuckets?.organizer,
      ...(participantBuckets?.attendees ?? []),
    ].filter(Boolean) as Record<string, unknown>[];

    const normalized = allParticipants
      .map((participant) => {
        const identity = participant.identity as Record<string, unknown> | undefined;
        const user = identity?.user as Record<string, unknown> | undefined;

        const name =
          (participant.displayName as string | undefined)?.trim() ||
          (user?.displayName as string | undefined)?.trim() ||
          'Participant';

        const email =
          (participant.upn as string | undefined)?.trim() ||
          (participant.emailAddress as string | undefined)?.trim() ||
          (user?.id as string | undefined)?.trim() ||
          null;

        return {
          name,
          email,
        };
      })
      .filter((participant) => participant.name);

    const seen = new Set<string>();

    return normalized.filter((participant) => {
      const dedupeKey = `${participant.name.toLowerCase()}|${(participant.email || '').toLowerCase()}`;

      if (seen.has(dedupeKey)) {
        return false;
      }

      seen.add(dedupeKey);

      return true;
    });
  }

  private meetingAccessWhere(user: User): Prisma.MeetingWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    return {
      participants: {
        some: {
          OR: [
            {
              userId: user.id,
            },
            {
              email: user.email,
            },
          ],
        },
      },
    };
  }
}
