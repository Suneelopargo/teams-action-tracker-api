import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
        this.configService.getOrThrow<string>('AZURE_TENANT_ID'),
        this.configService.getOrThrow<string>('AZURE_CLIENT_ID'),
        this.configService.getOrThrow<string>('AZURE_CLIENT_SECRET'),
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
    const fromUser = this.configService.getOrThrow<string>('MAIL_FROM');

    await this.graphClient
      .api(`/users/${fromUser}/sendMail`)
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

  async getMeetingDetails(
    meetingId: string,
    organizerUserId?: string,
  ) {
    if (!meetingId?.trim()) {
      throw new BadRequestException('meetingId is required');
    }

    const organizer = this.getOrganizerUserId(organizerUserId);

    try {
      return await this.graphClient
        .api(`/users/${organizer}/onlineMeetings/${meetingId}`)
        .select(
          [
            'id',
            'subject',
            'startDateTime',
            'endDateTime',
            'joinWebUrl',
            'participants',
            'lobbyBypassSettings',
            'creationDateTime',
          ].join(','),
        )
        .get();
    } catch {
      throw new InternalServerErrorException(
        `Failed to fetch meeting details from Microsoft Graph for meetingId: ${meetingId}`,
      );
    }
  }

  async getMeetingDetailsByJoinWebUrl(
    joinWebUrl: string,
    organizerUserId?: string,
  ) {
    if (!joinWebUrl?.trim()) {
      throw new BadRequestException('joinWebUrl is required');
    }

    const organizer = this.getOrganizerUserId(organizerUserId);
    const escapedJoinUrl = joinWebUrl.replace(/'/g, "''");

    try {
      const response = await this.graphClient
        .api(`/users/${organizer}/onlineMeetings`)
        .filter(`JoinWebUrl eq '${escapedJoinUrl}'`)
        .top(1)
        .get();

      return response?.value?.[0] ?? null;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch meeting details from Microsoft Graph using joinWebUrl',
      );
    }
  }

  private getOrganizerUserId(organizerUserId?: string) {
    return (
      organizerUserId ||
      this.configService.get<string>('GRAPH_MEETING_ORGANIZER_ID') ||
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.getOrThrow<string>('AZURE_CLIENT_ID')
    );
  }
}