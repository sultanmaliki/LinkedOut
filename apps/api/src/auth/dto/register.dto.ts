import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name = '';

  @IsEmail()
  email = '';

  @IsString()
  @MinLength(8)
  password = '';
}
