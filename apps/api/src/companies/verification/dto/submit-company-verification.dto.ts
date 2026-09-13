import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SubmitCompanyVerificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  taxIdentificationNumber?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  verificationDocumentUrl?: string;
}
