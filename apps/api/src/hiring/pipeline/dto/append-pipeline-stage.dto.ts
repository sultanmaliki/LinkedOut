import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { HIRING_PIPELINE_STAGES } from '../hiring-pipeline.repository';

export class AppendPipelineStageDto {
  @IsIn(HIRING_PIPELINE_STAGES)
  stage!: (typeof HIRING_PIPELINE_STAGES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // The interview date; required when stage is INTERVIEW_SCHEDULED, since
  // that's the anchor the ghosting timer counts from.
  @ValidateIf((dto: AppendPipelineStageDto) => dto.stage === 'INTERVIEW_SCHEDULED')
  @IsDateString()
  scheduledAt?: string;

  // Per-entry response-window override, in days. Only meaningful for
  // OFFER_RELEASED (how long the professional has to accept/decline).
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(60)
  windowDays?: number;
}
