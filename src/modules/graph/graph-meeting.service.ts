import { Injectable } from '@nestjs/common';

import { GraphService } from './graph.service';

@Injectable()
export class GraphMeetingService {
  constructor(private readonly graphService: GraphService) {}

  async getMeetingDetails(meetingId: string, organizerUserId?: string) {
    console.log('[GraphMeetingService:getMeetingDetails] forwarding request', {
      meetingId,
      organizerUserId,
    });

    return this.graphService.getMeetingDetails(meetingId, organizerUserId);
  }

  async getMeetingDetailsByJoinWebUrl(
    joinWebUrl: string,
    organizerUserId?: string,
  ) {
    console.log('[GraphMeetingService:getMeetingDetailsByJoinWebUrl] forwarding request', {
      organizerUserId,
      joinWebUrlPreview:
        joinWebUrl.length > 140
          ? `${joinWebUrl.slice(0, 140)}...`
          : joinWebUrl,
    });

    return this.graphService.getMeetingDetailsByJoinWebUrl(
      joinWebUrl,
      organizerUserId,
    );
  }
}
