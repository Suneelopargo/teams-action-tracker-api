import { Test, TestingModule } from '@nestjs/testing';

import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

describe('MeetingController', () => {
  let controller: MeetingController;

  const meetingServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    syncFromGraph: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingController],
      providers: [
        {
          provide: MeetingService,
          useValue: meetingServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MeetingController>(MeetingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
