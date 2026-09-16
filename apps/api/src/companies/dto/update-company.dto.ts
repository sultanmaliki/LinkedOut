import { companyTypeEnum } from '@linkedout/database';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  displayName?: string;

  @IsOptional()
  @IsIn(companyTypeEnum.enumValues)
  companyType?: (typeof companyTypeEnum.enumValues)[number];

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  website?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  employeeCount?: number;

  // Default response windows (days) applied to opportunities/offers this
  // company sends, when not overridden per-send. See
  // docs/architecture/hiring-pipeline-v2.md.
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(60)
  defaultResponseWindowDays?: number;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(60)
  defaultOfferWindowDays?: number;
}
