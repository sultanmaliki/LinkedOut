import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { REVIEW_RATING_CATEGORIES, ReviewRatingEntryDto } from './create-review.dto';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  review?: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(REVIEW_RATING_CATEGORIES.length)
  @ValidateNested({ each: true })
  @Type(() => ReviewRatingEntryDto)
  ratings?: ReviewRatingEntryDto[];
}
