import { Module } from '@nestjs/common';

import { ActionItemController } from './action-item.controller';
import { ActionItemService } from './action-item.service';

import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [OpenAiModule],
  controllers: [ActionItemController],
  providers: [ActionItemService],
})
export class ActionItemModule {}