import { employmentTypeEnum, workModeEnum } from '@linkedout/database';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateEmploymentHistoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsIn(employmentTypeEnum.enumValues)
  employmentType?: (typeof employmentTypeEnum.enumValues)[number];

  @IsOptional()
  @IsIn(workModeEnum.enumValues)
  workMode?: (typeof workModeEnum.enumValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyWorking?: boolean;
}
