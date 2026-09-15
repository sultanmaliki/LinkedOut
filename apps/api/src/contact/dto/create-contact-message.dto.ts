import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name = '';

  @IsEmail()
  email = '';

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message = '';
}
