import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Branch, BranchDocument } from '../schemas/branch.schema';

@Injectable()
export class BranchRepositoryImpl extends BaseRepositoryImpl<BranchDocument> {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
  ) {
    super(branchModel);
  }
}
