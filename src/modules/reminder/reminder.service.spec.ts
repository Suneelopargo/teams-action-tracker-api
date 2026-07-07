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
    jest.clearAllMocks();

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

  it('sends one consolidated reminder per recipient and updates all related action items', async () => {
    prismaServiceMock.actionItem.findMany.mockResolvedValue([
      {
        id: 1,
        assignedToUserId: 11,
        assignedUser: { email: 'alice@example.com', name: 'Alice' },
        ownerEmail: 'alice-owner@example.com',
        ownerName: 'Alice Owner',
        actionText: 'Share Q3 status report',
        description: null,
        priority: 'HIGH',
        dueDate: new Date('2026-07-10T00:00:00.000Z'),
        reminderSent: 0,
        meeting: { title: 'Leadership Sync' },
      },
      {
        id: 2,
        assignedToUserId: 11,
        assignedUser: { email: 'alice@example.com', name: 'Alice' },
        ownerEmail: 'alice-owner@example.com',
        ownerName: 'Alice Owner',
        actionText: 'Prepare release notes',
        description: null,
        priority: 'MEDIUM',
        dueDate: null,
        reminderSent: 1,
        meeting: { title: 'Product Review' },
      },
      {
        id: 3,
        assignedToUserId: 22,
        assignedUser: { email: 'bob@example.com', name: 'Bob' },
        ownerEmail: 'bob-owner@example.com',
        ownerName: 'Bob Owner',
        actionText: 'Validate API contract',
        description: null,
        priority: 'LOW',
        dueDate: null,
        reminderSent: 0,
        meeting: { title: 'Engineering Standup' },
      },
    ]);
    emailServiceMock.sendEmail.mockResolvedValue({ success: true });
    prismaServiceMock.emailLog.create.mockResolvedValue({});
    prismaServiceMock.actionItem.update.mockResolvedValue({});

    await service.sendDailyReminders();

    expect(emailServiceMock.sendEmail).toHaveBeenCalledTimes(2);
    expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Reminder: 2 Pending Action Items',
      expect.stringContaining('1. Share Q3 status report'),
      expect.stringContaining('<table'),
    );
    expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Reminder: 2 Pending Action Items',
      expect.stringContaining('2. Prepare release notes'),
      expect.stringContaining('<table'),
    );
    expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
      'bob@example.com',
      'Reminder: 1 Pending Action Item',
      expect.stringContaining('You have 1 pending action item:'),
      expect.stringContaining('<strong>1</strong> pending action item'),
    );

    expect(prismaServiceMock.emailLog.create).toHaveBeenCalledTimes(2);
    expect(prismaServiceMock.emailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionItemId: 1,
          emailTo: 'alice@example.com',
          subject: 'Reminder: 2 Pending Action Items',
          status: 'SENT',
        }),
      }),
    );
    expect(prismaServiceMock.emailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionItemId: 3,
          emailTo: 'bob@example.com',
          subject: 'Reminder: 1 Pending Action Item',
          status: 'SENT',
        }),
      }),
    );
    expect(prismaServiceMock.actionItem.update).toHaveBeenCalledTimes(3);
    expect(prismaServiceMock.actionItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
      }),
    );
    expect(prismaServiceMock.actionItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
      }),
    );
    expect(prismaServiceMock.actionItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3 },
      }),
    );
  });

  it('does not update reminders for a recipient group when consolidated email send fails', async () => {
    prismaServiceMock.actionItem.findMany.mockResolvedValue([
      {
        id: 10,
        assignedToUserId: 88,
        assignedUser: { email: 'failed@example.com', name: 'Fail User' },
        ownerEmail: 'failed-owner@example.com',
        ownerName: 'Fail Owner',
        actionText: 'Failed action one',
        description: null,
        priority: 'MEDIUM',
        dueDate: null,
        reminderSent: 0,
        meeting: { title: 'Ops Review' },
      },
      {
        id: 11,
        assignedToUserId: 88,
        assignedUser: { email: 'failed@example.com', name: 'Fail User' },
        ownerEmail: 'failed-owner@example.com',
        ownerName: 'Fail Owner',
        actionText: 'Failed action two',
        description: null,
        priority: 'HIGH',
        dueDate: null,
        reminderSent: 2,
        meeting: { title: 'Ops Review' },
      },
    ]);
    emailServiceMock.sendEmail.mockRejectedValue(new Error('SMTP down'));
    prismaServiceMock.emailLog.create.mockResolvedValue({});

    await service.sendDailyReminders();

    expect(emailServiceMock.sendEmail).toHaveBeenCalledTimes(1);
    expect(prismaServiceMock.actionItem.update).not.toHaveBeenCalled();
    expect(prismaServiceMock.emailLog.create).toHaveBeenCalledTimes(1);
    expect(prismaServiceMock.emailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actionItemId: 10,
          emailTo: 'failed@example.com',
          subject: 'Reminder: 2 Pending Action Items',
          status: 'FAILED',
        }),
      }),
    );
  });
});
