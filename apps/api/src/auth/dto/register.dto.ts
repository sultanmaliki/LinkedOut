import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name = '';

  // Normalize case so "Ada@Example.com" and "ada@example.com" are treated
  // as the same account instead of colliding as two separate registrations.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email = '';

  @IsString()
  @MinLength(8)
  password = '';
}
