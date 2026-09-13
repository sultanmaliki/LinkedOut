import { employmentTypeEnum, jobStatusEnum, workModeEnum } from '@linkedout/database';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsUUID()
  companyLocationId?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsIn(employmentTypeEnum.enumValues)
  employmentType?: (typeof employmentTypeEnum.enumValues)[number];

  @IsOptional()
  @IsIn(workModeEnum.enumValues)
  workMode?: (typeof workModeEnum.enumValues)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  openings?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsIn(jobStatusEnum.enumValues)
  status?: (typeof jobStatusEnum.enumValues)[number];
}
