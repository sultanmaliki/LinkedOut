import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { HIRING_PIPELINE_STAGES } from '../hiring-pipeline.repository';

export class AppendPipelineStageDto {
  @IsIn(HIRING_PIPELINE_STAGES)
  stage!: (typeof HIRING_PIPELINE_STAGES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
