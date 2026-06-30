import { Test, TestingModule } from '@nestjs/testing';

import { TranscriptController } from './transcript.controller';
import { TranscriptService } from './transcript.service';

describe('TranscriptController', () => {
  let controller: TranscriptController;

  const transcriptServiceMock = {
    saveTranscriptAndExtractActionItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranscriptController],
      providers: [
        {
          provide: TranscriptService,
          useValue: transcriptServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TranscriptController>(TranscriptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
