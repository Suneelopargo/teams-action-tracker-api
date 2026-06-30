import { Module } from '@nestjs/common';

import { ActionItemController } from './action-item.controller';
import { ActionItemService } from './action-item.service';

import { OpenAiModule } from '../openai/openai.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OpenAiModule, EmailModule],
  controllers: [ActionItemController],
  providers: [ActionItemService],
  exports: [ActionItemService],
})
export class ActionItemModule {}
