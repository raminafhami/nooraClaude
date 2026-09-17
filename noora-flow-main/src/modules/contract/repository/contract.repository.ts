import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Contract, ContractDocument } from '../schemas/contract.schema';
import { UserContractDto } from '../dto/user-contract.dto';

@Injectable()
export class ContractRepositoryImpl extends BaseRepositoryImpl<ContractDocument> {
  constructor(
    @InjectModel(Contract.name)
    protected contractModel: Model<ContractDocument>,
  ) {
    super(contractModel);
  }

  async findWithAggregation(pipeline: any[]) {
    const [result] = await this.contractModel.aggregate(pipeline);
    result.contracts = result.contracts.map((contract) => {
      contract.id = contract._id;
      delete contract._id;
      delete contract.userId;
      contract.user = new UserContractDto(contract.user);
      return contract;
    });
    result.count = result?.count ? result.count : 0;
    return result;
  }
}
