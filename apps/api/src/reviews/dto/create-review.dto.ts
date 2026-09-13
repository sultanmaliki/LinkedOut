import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const REVIEW_RATING_CATEGORIES = [
  'COMPENSATION',
  'CULTURE',
  'MANAGEMENT',
  'WORK_LIFE_BALANCE',
  'CAREER_GROWTH',
] as const;

export class ReviewRatingEntryDto {
  @IsIn(REVIEW_RATING_CATEGORIES)
  category!: (typeof REVIEW_RATING_CATEGORIES)[number];

  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;
}

export class CreateReviewDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  employmentHistoryId!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  review!: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REVIEW_RATING_CATEGORIES.length)
  @ValidateNested({ each: true })
  @Type(() => ReviewRatingEntryDto)
  ratings!: ReviewRatingEntryDto[];
}
