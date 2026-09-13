import { moderationReasonEnum } from '@linkedout/database';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const MODERATION_TARGET_TYPES = [
  'COMPANY',
  'PROFESSIONAL',
  'REVIEW',
  'POST',
  'OPPORTUNITY',
] as const;

export class CreateModerationCaseDto {
  @IsIn(MODERATION_TARGET_TYPES)
  targetType!: (typeof MODERATION_TARGET_TYPES)[number];

  @IsUUID()
  targetId!: string;

  @IsIn(moderationReasonEnum.enumValues)
  reason!: (typeof moderationReasonEnum.enumValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}
