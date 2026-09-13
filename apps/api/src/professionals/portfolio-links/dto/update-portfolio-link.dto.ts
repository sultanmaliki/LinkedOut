import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdatePortfolioLinkDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  url?: string;
}
