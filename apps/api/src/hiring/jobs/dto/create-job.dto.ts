import { employmentTypeEnum, workModeEnum } from '@linkedout/database';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @IsOptional()
  @IsUUID()
  companyLocationId?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsIn(employmentTypeEnum.enumValues)
  employmentType!: (typeof employmentTypeEnum.enumValues)[number];

  @IsIn(workModeEnum.enumValues)
  workMode!: (typeof workModeEnum.enumValues)[number];

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
}
