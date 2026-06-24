import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { ActionItemModule } from './modules/action-item/action-item.module';
import { TranscriptModule } from './modules/transcript/transcript.module';
import { EmailModule } from './modules/email/email.module';
import { OpenAiModule } from './modules/openai/openai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from './modules/reminder/reminder.module';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    MeetingModule,
    ActionItemModule,
    TranscriptModule,
    EmailModule,
    OpenAiModule,
    ReminderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
