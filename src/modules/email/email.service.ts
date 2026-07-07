import { Injectable, Logger } from '@nestjs/common';

import { GraphService } from '../graph/graph.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly graphService: GraphService) {}

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
      const htmlContent = html || this.convertTextToHtml(body);

      await this.graphService.sendMail(to, subject, htmlContent);

      this.logger.log(`Email sent successfully to ${to}`);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}`,
        error,
      );

      throw error;
    }
  }

  private convertTextToHtml(content: string) {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped.replace(/\r?\n/g, '<br />');
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
