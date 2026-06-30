import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  generateEmail(
    ownerName: string,
    actionText: string,
    priority: string,
    meetingTitle: string,
    dueDate?: Date | string | null,
  ) {
    const formattedDueDate = this.formatDueDate(dueDate);

    return {
      subject: `Follow-up: ${meetingTitle}`,
      body: `Hi ${ownerName || 'there'},

During the meeting "${meetingTitle}", the following action item was assigned to you:

- ${actionText}

Priority: ${priority || 'MEDIUM'}
Due Date: ${formattedDueDate}

Please provide an update before the next review meeting.

Thanks,
Teams Meeting Action Tracker
`,
    };
  }

  async sendEmail(to: string, subject: string, body: string) {
    await this.transporter.sendMail({
      from:
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('SMTP_USER'),
      to,
      subject,
      text: body,
    });

    return {
      success: true,
    };
  }

  private formatDueDate(dueDate?: Date | string | null) {
    if (!dueDate) {
      return 'Not specified';
    }

    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toISOString().slice(0, 10);
  }
}
