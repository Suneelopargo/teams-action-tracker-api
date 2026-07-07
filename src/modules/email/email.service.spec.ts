import { Test, TestingModule } from '@nestjs/testing';

import { GraphService } from '../graph/graph.service';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  const graphServiceMock = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: GraphService,
          useValue: graphServiceMock,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
