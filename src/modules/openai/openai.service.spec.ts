import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { OpenAiService } from './openai.service';

describe('OpenAiService', () => {
  let service: OpenAiService;

  const configServiceMock = {
    get: jest.fn((key: string) =>
      key === 'OPENAI_API_KEY' ? 'test-api-key' : undefined,
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
