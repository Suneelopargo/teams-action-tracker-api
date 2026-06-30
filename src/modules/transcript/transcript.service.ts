import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ActionItemService } from '../action-item/action-item.service';

@Injectable()
export class TranscriptService {
  constructor(
    private prisma: PrismaService,
    private actionItemService: ActionItemService,
  ) {}

  async saveTranscript(
    meetingId: number,
    transcriptText: string,
    sourceFile: string,
  ) {
    return this.prisma.transcript.create({
      data: {
        meetingId,
        transcriptText,
        sourceFile,
        sourceType: 'UPLOAD',
      },
    });
  }

  async saveTranscriptAndExtractActionItems(
    meetingId: number,
    transcriptText: string,
    sourceFile: string,
  ) {
    const transcript = await this.saveTranscript(
      meetingId,
      transcriptText,
      sourceFile,
    );

    const actionItems = await this.actionItemService.extract(transcript.id);

    return {
      transcript,
      actionItems,
    };
  }
}
