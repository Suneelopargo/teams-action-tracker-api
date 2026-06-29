import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;

  const prismaServiceMock = {
    actionItem: {
      findUnique: jest.fn(),
    },
    emailLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const emailServiceMock = {
    generateEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
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

    controller = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
