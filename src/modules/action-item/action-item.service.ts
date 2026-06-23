import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class ActionItemService {
  constructor(
    private prisma: PrismaService,
    private openAiService: OpenAiService,
  ) {}

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

  const savedActionItems = await Promise.all(
    actionItems.map((item) =>
      this.prisma.actionItem.create({
        data: {
          meetingId: transcript.meetingId,
          ownerName:
            item.ownerName || 'Unknown',
          actionText:
            item.actionText || '',
          priority:
            item.priority || 'MEDIUM',
          status: 'OPEN',
        },
      }),
    ),
  );

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
}