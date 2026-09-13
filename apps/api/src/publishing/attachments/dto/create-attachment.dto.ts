import { attachmentTypeEnum } from '@linkedout/database';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Min, MaxLength } from 'class-validator';

export class CreateAttachmentDto {
  @IsIn(attachmentTypeEnum.enumValues)
  type!: (typeof attachmentTypeEnum.enumValues)[number];

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsUrl()
  @MaxLength(2048)
  fileUrl!: string;

  @IsString()
  @MaxLength(255)
  mimeType!: string;

  @IsInt()
  @Min(1)
  fileSize!: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  thumbnailUrl?: string;
}
