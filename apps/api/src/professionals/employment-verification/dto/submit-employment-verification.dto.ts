import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SubmitEmploymentVerificationDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  companyEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  employeeId?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  idCardUrl?: string;
}
