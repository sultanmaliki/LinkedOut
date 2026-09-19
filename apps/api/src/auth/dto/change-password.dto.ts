import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword = '';

  @IsString()
  @MinLength(8)
  @Matches(/\S/, { message: 'newPassword must not be entirely whitespace' })
  newPassword = '';
}
