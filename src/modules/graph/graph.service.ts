import {
  BadRequestException,
  ForbiddenException,
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
    console.log('[GraphService:getMeetingDetails] start', {
      meetingId,
      organizerUserId,
    });

    if (!meetingId?.trim()) {
      throw new BadRequestException('meetingId is required');
    }

    const organizer = this.getOrganizerUserId(organizerUserId);

    console.log('[GraphService:getMeetingDetails] organizer resolved', {
      organizer,
    });

    try {
      const response = await this.graphClient
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

      console.log('[GraphService:getMeetingDetails] success', {
        id: response?.id,
        subject: response?.subject,
        startDateTime: response?.startDateTime,
      });

      return response;
    } catch {
      console.error('[GraphService:getMeetingDetails] failed', {
        meetingId,
        organizer,
      });

      throw new InternalServerErrorException(
        `Failed to fetch meeting details from Microsoft Graph for meetingId: ${meetingId}`,
      );
    }
  }

  async getMeetingDetailsByJoinWebUrl(
    joinWebUrl: string,
    organizerUserId?: string,
  ) {
    console.log('[GraphService:getMeetingDetailsByJoinWebUrl] start', {
      organizerUserId,
      joinWebUrlPreview: this.previewValue(joinWebUrl),
    });

    if (!joinWebUrl?.trim()) {
      throw new BadRequestException('joinWebUrl is required');
    }

    const normalizedJoinUrl = joinWebUrl.trim();
    const decodedJoinUrl = this.safeDecodeUri(normalizedJoinUrl);
    const organizerFromJoinUrl = this.extractOrganizerFromJoinWebUrl(normalizedJoinUrl);

    const organizer =
      organizerUserId || organizerFromJoinUrl || this.getOrganizerUserId();

    console.log('[GraphService:getMeetingDetailsByJoinWebUrl] organizer resolution', {
      organizer,
      organizerUserId,
      organizerFromJoinUrl,
      normalizedJoinUrlPreview: this.previewValue(normalizedJoinUrl),
      decodedJoinUrlPreview: this.previewValue(decodedJoinUrl),
    });

    try {
      const meeting = await this.findOnlineMeetingByJoinWebUrl(
        organizer,
        normalizedJoinUrl,
        decodedJoinUrl,
      );

      console.log('[GraphService:getMeetingDetailsByJoinWebUrl] completed', {
        found: Boolean(meeting),
        id: meeting?.id,
        subject: meeting?.subject,
      });

      return meeting;
    } catch (error) {
      this.logGraphError(
        '[GraphService:getMeetingDetailsByJoinWebUrl] failed',
        error,
      );

      throw new InternalServerErrorException(
        'Failed to fetch meeting details from Microsoft Graph using joinWebUrl',
      );
    }
  }

  private async findOnlineMeetingByJoinWebUrl(
    organizer: string,
    rawJoinWebUrl: string,
    decodedJoinWebUrl: string,
  ) {
    const attempts = Array.from(
      new Set([rawJoinWebUrl, decodedJoinWebUrl].filter(Boolean)),
    );

    let permissionErrorDetected = false;

    for (let index = 0; index < attempts.length; index += 1) {
      const candidate = attempts[index];
      const escaped = candidate.replace(/'/g, "''");

      console.log('[GraphService:findOnlineMeetingByJoinWebUrl] user-scope attempt', {
        organizer,
        attempt: index + 1,
        candidatePreview: this.previewValue(candidate),
      });

      try {
        const userScopedResponse = await this.graphClient
          .api(`/users/${organizer}/onlineMeetings`)
          .filter(`JoinWebUrl eq '${escaped}'`)
          .top(1)
          .get();

        if (userScopedResponse?.value?.[0]) {
          console.log('[GraphService:findOnlineMeetingByJoinWebUrl] match in user scope', {
            organizer,
            attempt: index + 1,
            id: userScopedResponse.value[0]?.id,
          });

          return userScopedResponse.value[0];
        }

        console.log('[GraphService:findOnlineMeetingByJoinWebUrl] no match in user scope', {
          organizer,
          attempt: index + 1,
        });
      } catch (error) {
        this.logGraphError(
          '[GraphService:findOnlineMeetingByJoinWebUrl] user scope query failed',
          error,
        );

        if (this.isMissingPermissionError(error)) {
          permissionErrorDetected = true;
        }
      }

      console.log('[GraphService:findOnlineMeetingByJoinWebUrl] communications-scope attempt', {
        attempt: index + 1,
        candidatePreview: this.previewValue(candidate),
      });

      try {
        const communicationsResponse = await this.graphClient
          .api('/communications/onlineMeetings')
          .filter(`JoinWebUrl eq '${escaped}'`)
          .top(1)
          .get();

        if (communicationsResponse?.value?.[0]) {
          console.log('[GraphService:findOnlineMeetingByJoinWebUrl] match in communications scope', {
            attempt: index + 1,
            id: communicationsResponse.value[0]?.id,
          });

          return communicationsResponse.value[0];
        }

        console.log('[GraphService:findOnlineMeetingByJoinWebUrl] no match in communications scope', {
          attempt: index + 1,
        });
      } catch (error) {
        this.logGraphError(
          '[GraphService:findOnlineMeetingByJoinWebUrl] communications scope query failed',
          error,
        );

        if (this.isMissingPermissionError(error)) {
          permissionErrorDetected = true;
        }
      }
    }

    if (permissionErrorDetected) {
      throw new ForbiddenException(
        'Microsoft Graph permission missing. Grant and admin-consent application permissions such as OnlineMeetings.Read.All (and, if required by your tenant flow, OnlineMeetingArtifact.Read.All), then retry sync.',
      );
    }

    console.warn('[GraphService:findOnlineMeetingByJoinWebUrl] no meeting found for all attempts', {
      organizer,
      attemptCount: attempts.length,
    });

    return null;
  }

  private extractOrganizerFromJoinWebUrl(joinWebUrl: string): string | undefined {
    try {
      const parsedUrl = new URL(joinWebUrl);
      const context = parsedUrl.searchParams.get('context');

      if (!context) {
        return undefined;
      }

      const decodedContext = decodeURIComponent(context);
      const contextJson = JSON.parse(decodedContext) as {
        Oid?: string;
      };

      const organizer = contextJson.Oid?.trim() || undefined;

      console.log('[GraphService:extractOrganizerFromJoinWebUrl] parsed context', {
        organizer,
      });

      return organizer;
    } catch {
      console.warn('[GraphService:extractOrganizerFromJoinWebUrl] failed to parse organizer context', {
        joinWebUrlPreview: this.previewValue(joinWebUrl),
      });

      return undefined;
    }
  }

  private safeDecodeUri(value: string) {
    try {
      const decoded = decodeURIComponent(value);

      if (decoded !== value) {
        console.log('[GraphService:safeDecodeUri] decoded join url', {
          rawPreview: this.previewValue(value),
          decodedPreview: this.previewValue(decoded),
        });
      }

      return decoded;
    } catch {
      console.warn('[GraphService:safeDecodeUri] decode failed, using original value', {
        valuePreview: this.previewValue(value),
      });

      return value;
    }
  }

  private previewValue(value: string | undefined, max = 140) {
    if (!value) {
      return value;
    }

    return value.length > max
      ? `${value.slice(0, max)}...`
      : value;
  }

  private logGraphError(context: string, error: unknown) {
    const graphError = error as {
      statusCode?: number;
      code?: string;
      message?: string;
      body?: unknown;
      stack?: string;
    };

    console.error(context, {
      statusCode: graphError?.statusCode,
      code: graphError?.code,
      message: graphError?.message,
      body: graphError?.body,
      stack: graphError?.stack,
    });
  }

  private isMissingPermissionError(error: unknown) {
    const graphError = error as {
      statusCode?: number;
      message?: string;
      body?: unknown;
    };

    const bodyText =
      typeof graphError?.body === 'string'
        ? graphError.body
        : JSON.stringify(graphError?.body || '');

    return (
      graphError?.statusCode === 403 &&
      (
        (graphError?.message || '').toLowerCase().includes('missing required permissions') ||
        bodyText.toLowerCase().includes('missing required permissions')
      )
    );
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