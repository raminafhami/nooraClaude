import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { SamplingPriceRepositoryImpl } from './repository/sampling-price.repository';
import { SamplingPriceDocument } from './schemas/sampling-price.schema';

@Injectable()
export class SamplingPriceService extends CrudService<SamplingPriceDocument> {
  constructor(
    private readonly samplingPriceRepository: SamplingPriceRepositoryImpl,
  ) {
    super(samplingPriceRepository);
  }
}
