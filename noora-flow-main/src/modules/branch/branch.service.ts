import { Injectable } from '@nestjs/common';
import { BranchRepositoryImpl } from './repository/branch.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { BranchDocument } from './schemas/branch.schema';

@Injectable()
export class BranchService extends CrudService<BranchDocument> {
  constructor(private branchRepository: BranchRepositoryImpl) {
    super(branchRepository);
  }
}
