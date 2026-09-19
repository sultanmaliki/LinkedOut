import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

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
  // MinLength alone counts whitespace, so "        " (8 spaces) satisfies
  // it -- require at least one non-whitespace character too.
  @Matches(/\S/, { message: 'password must not be entirely whitespace' })
  password = '';
}
