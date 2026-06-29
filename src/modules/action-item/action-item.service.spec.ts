import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';
import { OpenAiService } from '../openai/openai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActionItemService } from './action-item.service';

describe('ActionItemService', () => {
  let service: ActionItemService;

  const prismaServiceMock = {
    actionItem: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    emailLog: {
      create: jest.fn(),
    },
    meeting: {
      findUnique: jest.fn(),
    },
    participant: {
      findFirst: jest.fn(),
    },
    transcript: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const openAiServiceMock = {
    extractActionItems: jest.fn(),
  };

  const emailServiceMock = {
    generateEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionItemService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: OpenAiService,
          useValue: openAiServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<ActionItemService>(ActionItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
