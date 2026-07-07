import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [PrismaModule, ConfigModule, GraphModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
