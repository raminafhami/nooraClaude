import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { SubContractorDocument } from './schema/sub-contractor.schema';
import { SubContractorRepositoryImpl } from './repository/sub-contractor.repository';

@Injectable()
export class SubContractorService extends CrudService<SubContractorDocument> {
  constructor(
    private subContractorRepositoryImpl: SubContractorRepositoryImpl,
  ) {
    super(subContractorRepositoryImpl);
  }
}
