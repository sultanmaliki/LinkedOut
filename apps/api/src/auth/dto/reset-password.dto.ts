import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token = '';

  @IsString()
  @MinLength(8)
  @Matches(/\S/, { message: 'newPassword must not be entirely whitespace' })
  newPassword = '';
}
