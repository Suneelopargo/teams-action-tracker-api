import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import * as fs from 'fs';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TranscriptService } from './transcript.service';

@ApiTags('Transcripts')
@ApiBearerAuth()
@Controller('transcripts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        meetingId: {
          type: 'number',
          example: 1,
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
    }),
  )
  async uploadTranscript(
    @UploadedFile() file: any,
    @Body('meetingId') meetingId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Please upload a transcript file');
    }

    const parsedMeetingId = Number(meetingId);

    if (!parsedMeetingId) {
      throw new BadRequestException('Valid meetingId is required');
    }

    const transcriptText = fs.readFileSync(file.path, 'utf8');

    return this.transcriptService.saveTranscriptAndExtractActionItems(
      parsedMeetingId,
      transcriptText,
      file.originalname,
    );
  }
}
