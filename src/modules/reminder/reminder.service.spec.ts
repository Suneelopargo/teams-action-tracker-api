import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReminderService } from './reminder.service';

describe('ReminderService', () => {
  let service: ReminderService;

  const prismaServiceMock = {
    actionItem: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    emailLog: {
      create: jest.fn(),
    },
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<ReminderService>(ReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
