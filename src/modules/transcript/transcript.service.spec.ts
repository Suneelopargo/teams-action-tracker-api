import { Test, TestingModule } from '@nestjs/testing';

import { ActionItemService } from '../action-item/action-item.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TranscriptService } from './transcript.service';

describe('TranscriptService', () => {
  let service: TranscriptService;

  const prismaServiceMock = {
    transcript: {
      create: jest.fn(),
    },
  };

  const actionItemServiceMock = {
    extract: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: ActionItemService,
          useValue: actionItemServiceMock,
        },
      ],
    }).compile();

    service = module.get<TranscriptService>(TranscriptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
