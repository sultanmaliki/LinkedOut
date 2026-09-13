import { employmentTypeEnum, noticePeriodEnum, workModeEnum } from '@linkedout/database';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SetEmploymentExpectationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  desiredJobTitle!: string;

  @IsIn(employmentTypeEnum.enumValues)
  employmentType!: (typeof employmentTypeEnum.enumValues)[number];

  @IsIn(workModeEnum.enumValues)
  workMode!: (typeof workModeEnum.enumValues)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedSalaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedSalaryMax?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsIn(noticePeriodEnum.enumValues)
  noticePeriod?: (typeof noticePeriodEnum.enumValues)[number];

  @IsOptional()
  @IsBoolean()
  openToRelocation?: boolean;

  @IsOptional()
  @IsBoolean()
  activelyLooking?: boolean;
}
