import { Module } from '@nestjs/common';
import { ActionItemService } from './action-item.service';
import { ActionItemController } from './action-item.controller';


@Module({
  providers: [ActionItemService],
  controllers: [ActionItemController]
})
export class ActionItemModule {}
