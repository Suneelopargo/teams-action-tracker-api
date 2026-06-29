import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { MeetingService } from './meeting.service';

describe('MeetingService', () => {
  let service: MeetingService;

  const prismaServiceMock = {
    meeting: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
