import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsUUID()
  asCompanyId?: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}
