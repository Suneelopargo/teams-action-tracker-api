import { Test, TestingModule } from '@nestjs/testing';

import { GraphMeetingService } from '../graph/graph-meeting.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MeetingService } from './meeting.service';

describe('MeetingService', () => {
  let service: MeetingService;

  const prismaServiceMock = {
    $transaction: jest.fn(),
    meeting: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    participant: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const graphMeetingServiceMock = {
    getMeetingDetails: jest.fn(),
    getMeetingDetailsByJoinWebUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: GraphMeetingService,
          useValue: graphMeetingServiceMock,
        },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
