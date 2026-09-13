import { IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitCompanyReplyDto {
  @IsString()
  @MinLength(4)
  @MaxLength(5000)
  reply!: string;
}
