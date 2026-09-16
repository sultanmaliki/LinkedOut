import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

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
  @Min(7)
  @Max(60)
  responseWindowDays?: number;
}
