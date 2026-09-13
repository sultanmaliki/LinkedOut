import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTrustFlagDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  targetType!: string;

  @IsUUID()
  targetId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  reason!: string;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  scoreImpact?: number;
}
