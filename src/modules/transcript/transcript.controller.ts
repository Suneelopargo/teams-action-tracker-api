import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import * as fs from 'fs';

import { TranscriptService } from './transcript.service';

@ApiTags('Transcripts')
@Controller('transcripts')
export class TranscriptController {
  constructor(
    private readonly transcriptService: TranscriptService,
  ) {}

  @Post('upload')
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
      throw new BadRequestException(
        'Please upload a transcript file',
      );
    }

    const transcriptText = fs.readFileSync(
      file.path,
      'utf8',
    );

    return this.transcriptService.saveTranscript(
      Number(meetingId),
      transcriptText,
      file.originalname,
    );
  }
}