import { moderationStatusEnum } from '@linkedout/database';
import { IsIn } from 'class-validator';

export class UpdateCaseStatusDto {
  @IsIn(moderationStatusEnum.enumValues)
  status!: (typeof moderationStatusEnum.enumValues)[number];
}
