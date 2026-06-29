import { IsIn, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'])
  status!: string;
}
