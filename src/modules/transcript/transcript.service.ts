import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TranscriptService {

  constructor(
    private prisma: PrismaService,
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
}