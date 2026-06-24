import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {

  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
  ) {

    this.transporter =
      nodemailer.createTransport({
        host:
          this.configService.get(
            'SMTP_HOST',
          ),

        port: Number(
          this.configService.get(
            'SMTP_PORT',
          ),
        ),

        secure: false,

        auth: {
          user:
            this.configService.get(
              'SMTP_USER',
            ),

          pass:
            this.configService.get(
              'SMTP_PASS',
            ),
        },
      });
  }

  generateEmail(
    ownerName: string,
    actionText: string,
    priority: string,
    meetingTitle: string,
  ) {

    return {
      subject: `Follow-up: ${meetingTitle}`,

      body: `
Hi ${ownerName},

During the meeting "${meetingTitle}",
the following action item was assigned to you:

• ${actionText}

Priority: ${priority}

Please provide an update before the next review meeting.

Thanks,
Teams Meeting Action Tracker
`,
    };
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ) {

    await this.transporter.sendMail({
      from:
        this.configService.get(
          'SMTP_USER',
        ),

      to,

      subject,

      text: body,
    });

    return {
      success: true,
    };
  }
}