import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateProfessionalProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  profilePhotoUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  bannerPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  currentLocation?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  personalWebsite?: string;
}
