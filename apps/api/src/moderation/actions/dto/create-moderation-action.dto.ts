import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const MODERATION_ACTIONS = [
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_BANNED',
  'COMPANY_VERIFICATION_REVOKED',
] as const;

export class CreateModerationActionDto {
  @IsIn(MODERATION_ACTIONS)
  action!: (typeof MODERATION_ACTIONS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
