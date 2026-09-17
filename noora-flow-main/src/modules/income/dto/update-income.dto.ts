import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateIncomeDto } from './create-income.dto';
import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';

export class UpdateIncomeDto extends PartialType(
  PickType(CreateIncomeDto, [
    'title',
    'additionalFee',
    'amount',
    'categoryId',
    'currency',
    'currencyRate',
    'description',
    'discount',
    'quantity',
  ]),
) {
  @ApiHideProperty()
  activeUser?: ActiveUserData;
}
