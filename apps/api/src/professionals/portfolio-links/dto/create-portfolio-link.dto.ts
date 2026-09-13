import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreatePortfolioLinkDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsUrl()
  @MaxLength(2048)
  url!: string;
}
