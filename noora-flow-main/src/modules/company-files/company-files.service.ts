import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CompanyFileDocument } from './schemas/company-file.schema';
import { CompanyFileRepositoryImpl } from './repository/company-files.repository';

@Injectable()
export class CompanyFilesService extends CrudService<CompanyFileDocument> {
  constructor(private companyFileRepositoryImpl: CompanyFileRepositoryImpl) {
    super(companyFileRepositoryImpl);
  }
}
