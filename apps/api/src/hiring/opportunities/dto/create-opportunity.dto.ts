import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateOpportunityDto {
  @IsUUID()
  professionalProfileId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
