import { IsOptional, IsUUID } from 'class-validator';

export class ToggleLikeDto {
  @IsOptional()
  @IsUUID()
  asCompanyId?: string;
}
