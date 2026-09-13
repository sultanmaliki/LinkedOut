import { postVisibilityEnum } from '@linkedout/database';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsUUID()
  asCompanyId?: string;

  @IsString()
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsIn(postVisibilityEnum.enumValues)
  visibility?: (typeof postVisibilityEnum.enumValues)[number];

  @ValidateIf((dto: CreatePostDto) => dto.visibility === 'SCHEDULED')
  @IsDateString()
  scheduledAt?: string;
}
