import { contactMethodTypeEnum } from '@linkedout/database';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class ContactMethodEntryDto {
  @IsIn(contactMethodTypeEnum.enumValues)
  type!: (typeof contactMethodTypeEnum.enumValues)[number];

  @IsString()
  @MaxLength(255)
  value!: string;
}

export class RespondToOpportunityDto {
  @IsBoolean()
  accepted!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  message?: string;

  @ValidateIf((dto: RespondToOpportunityDto) => dto.accepted === true)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ContactMethodEntryDto)
  contactMethods?: ContactMethodEntryDto[];
}
