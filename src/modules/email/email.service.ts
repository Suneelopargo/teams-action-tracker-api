import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dns from 'node:dns';
import * as net from 'net';

// Force IPv4 before IPv6
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(
      this.configService.get<string>('SMTP_PORT') || 587,
    );
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');

    this.logger.log(`SMTP_HOST: ${host}`);
    this.logger.log(`SMTP_PORT: ${port}`);
    this.logger.log(`SMTP_SECURE: ${secure}`);
    this.logger.log(`SMTP_USER configured: ${!!user}`);



    const socket = net.createConnection({
      host: 'smtp.office365.com',
      port: 587,
    });

    socket.on('connect', () => {
      console.log('TCP CONNECT SUCCESS');
      socket.destroy();
    });

    socket.on('error', (err) => {
      console.error('TCP CONNECT ERROR', err);
    });

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      logger: true,
      debug: true,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,

      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connectivity on startup
    this.transporter
      .verify()
      .then(() => {
        this.logger.log('✅ SMTP connection verified successfully');
      })
      .catch((error) => {
        this.logger.error('❌ SMTP verification failed', error);
      });

    // Check DNS resolution
    dns.lookup(host || '', { all: true }, (err, addresses) => {
      if (err) {
        this.logger.error('DNS lookup failed', err);
      } else {
        this.logger.log(
          `Resolved SMTP addresses: ${JSON.stringify(addresses)}`,
        );
      }
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

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from:
          this.configService.get<string>('SMTP_FROM') ||
          this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        text: body,
        html,
      });

      this.logger.log(
        `✅ Email sent successfully. Message ID: ${info.messageId}`,
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${to}`,
        error,
      );

      throw error;
    }
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
