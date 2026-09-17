import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { IndustryDocument } from './schemas/industry.schema';
import { IndustryRepositoryImpl } from './repository/industry.repository';

@Injectable()
export class IndustryService extends CrudService<IndustryDocument> {
  constructor(private industryRepositoryImpl: IndustryRepositoryImpl) {
    super(industryRepositoryImpl);
  }
}
