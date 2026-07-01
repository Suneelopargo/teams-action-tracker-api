import { Injectable } from '@nestjs/common';

import { GraphService } from './graph.service';

@Injectable()
export class GraphMeetingService {
  constructor(private readonly graphService: GraphService) {}

  async getMeetingDetails(meetingId: string, organizerUserId?: string) {
    return this.graphService.getMeetingDetails(meetingId, organizerUserId);
  }

  async getMeetingDetailsByJoinWebUrl(
    joinWebUrl: string,
    organizerUserId?: string,
  ) {
    return this.graphService.getMeetingDetailsByJoinWebUrl(
      joinWebUrl,
      organizerUserId,
    );
  }
}
