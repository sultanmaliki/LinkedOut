import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ReviewVerificationDto {
  @IsIn(['VERIFIED', 'REJECTED'])
  status!: 'VERIFIED' | 'REJECTED';

  // Required (via ValidateIf) when rejecting -- a moderator should never
  // reject without saying why. Not validated at all when approving.
  @ValidateIf((dto: ReviewVerificationDto) => dto.status === 'REJECTED')
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  rejectionReason?: string;
}
