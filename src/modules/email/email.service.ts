import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

@Injectable()
export class EmailService {
  private graphClient: Client;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const credential =
      new ClientSecretCredential(
        this.configService.get<string>('AZURE_TENANT_ID')!,
        this.configService.get<string>('AZURE_CLIENT_ID')!,
        this.configService.get<string>('AZURE_CLIENT_SECRET')!,
      );

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token =
            await credential.getToken(
              'https://graph.microsoft.com/.default',
            );

          return token?.token || '';
        },
      } as any,
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

During the meeting "${meetingTitle}", the following action item was assigned to you:

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
    await this.graphClient
      .api(
        `/users/${this.configService.get(
          'MAIL_FROM',
        )}/sendMail`,
      )
      .post({
        message: {
          subject,
          body: {
            contentType: 'Text',
            content: body,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
      });

    return {
      success: true,
    };
  }
}