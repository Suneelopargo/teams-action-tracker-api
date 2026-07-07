import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class SyncGraphMeetingDto {
  @ApiPropertyOptional({
    example: 'MSpkN2YzYjQxYy0xZTQ4LTQ2N2QtODc1Yi0zMzUxNzE5N2RmNzYqMCoqMTk6bWVldGluZ19...'
  })
  @ValidateIf((payload: SyncGraphMeetingDto) => !payload.joinWebUrl)
  @IsString()
  @IsNotEmpty()
  graphMeetingId?: string;

  @ApiPropertyOptional({
    example: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0?context=%7b%22Tid%22%3a%22...%22%7d'
  })
  @ValidateIf((payload: SyncGraphMeetingDto) => !payload.graphMeetingId)
  @IsString()
  @IsNotEmpty()
  joinWebUrl?: string;

  @ApiPropertyOptional({
    example: 'organizer@contoso.com'
  })
  @IsOptional()
  @IsString()
  organizerUserId?: string;
}
