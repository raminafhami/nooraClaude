import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSamplingPriceDto } from './create-sampling-price.dto';

export class UpdateSamplingPriceDto extends PartialType(
  CreateSamplingPriceDto,
) {}
