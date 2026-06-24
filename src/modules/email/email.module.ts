import { Module } from '@nestjs/common';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [PrismaModule,
    ConfigModule],
  controllers: [EmailController],
  providers: [EmailService],
   exports: [
    EmailService,
  ]
})
export class EmailModule {}