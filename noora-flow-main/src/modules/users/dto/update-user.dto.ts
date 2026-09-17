import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LoginTypes } from '../schemas/user.schema';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserLoginTypeDto {
  @IsNotEmpty()
  @IsEnum(LoginTypes)
  loginType: LoginTypes;
}

export class AddBankInfoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  bankCardNumber: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  bankSheba?: string;

  @IsOptional()
  bankAccountOwner?: string;

  @IsOptional()
  bankBranch?: string;
}

export class EditBankInfoDto extends PartialType(AddBankInfoDto) {}
