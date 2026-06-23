import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateMeetingDto {

  @ApiProperty({
    example: 'Sprint Planning Meeting'
  })
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: '2026-06-23T10:00:00.000Z'
  })
  @IsDateString()
  meetingDate!: string;
}