import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['startIndex', 'endIndex'] as const),
) {}
