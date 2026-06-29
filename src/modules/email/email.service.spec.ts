import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  const configServiceMock = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        SMTP_HOST: 'localhost',
        SMTP_PORT: '1025',
        SMTP_USER: 'test@example.com',
        SMTP_PASS: 'password',
      };

      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
