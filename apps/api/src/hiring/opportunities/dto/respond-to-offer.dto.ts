import { IsBoolean } from 'class-validator';

export class RespondToOfferDto {
  @IsBoolean()
  accepted!: boolean;
}
