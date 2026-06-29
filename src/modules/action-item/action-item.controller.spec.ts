import { Test, TestingModule } from '@nestjs/testing';

import { ActionItemController } from './action-item.controller';
import { ActionItemService } from './action-item.service';

describe('ActionItemController', () => {
  let controller: ActionItemController;

  const actionItemServiceMock = {
    extract: jest.fn(),
    findAll: jest.fn(),
    findForUser: jest.fn(),
    findByMeeting: jest.fn(),
    updateStatus: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionItemController],
      providers: [
        {
          provide: ActionItemService,
          useValue: actionItemServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ActionItemController>(ActionItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
