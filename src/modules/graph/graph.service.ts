import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

import 'isomorphic-fetch';

@Injectable()
export class GraphService {
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

    this.graphClient =
      Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token =
              await credential.getToken(
                'https://graph.microsoft.com/.default',
              );

            return token?.token || '';
          },
        },
      });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ) {
    await this.graphClient
      .api(`/users/${process.env.MAIL_FROM}/sendMail`)
      .post({
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: html,
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