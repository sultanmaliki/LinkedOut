import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

import { MAX_WINDOW_DAYS, MIN_WINDOW_DAYS } from '../../pipeline/pipeline-status.util';

export class CreateOpportunityDto {
  @IsUUID()
  professionalProfileId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  // Overrides the company's default (which itself falls back to the system
  // default) for how long the professional has to respond to this specific
  // opportunity. See docs/architecture/hiring-pipeline-v2.md.
  @IsOptional()
  @IsInt()
  @Min(MIN_WINDOW_DAYS)
  @Max(MAX_WINDOW_DAYS)
  responseWindowDays?: number;
}
