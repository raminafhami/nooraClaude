import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  ContractNumber,
  ContractNumberDocument,
} from '../schemas/contract-number.schema';

@Injectable()
export class ContractNumberRepositoryImpl extends BaseRepositoryImpl<ContractNumberDocument> {
  constructor(
    @InjectModel(ContractNumber.name)
    protected contractNumberModel: Model<ContractNumberDocument>,
  ) {
    super(contractNumberModel);
  }
}
