import { Test, TestingModule } from '@nestjs/testing';
import { ActionItemController } from './action-item.controller';

describe('ActionItemController', () => {
  let controller: ActionItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionItemController],
    }).compile();

    controller = module.get<ActionItemController>(ActionItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
