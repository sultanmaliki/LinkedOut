import { userRoleEnum } from '@linkedout/database';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(userRoleEnum.enumValues)
  role!: (typeof userRoleEnum.enumValues)[number];
}
