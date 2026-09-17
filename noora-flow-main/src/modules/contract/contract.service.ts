import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ContractRepositoryImpl } from './repository/contract.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ContractDocument } from './schemas/contract.schema';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import * as mongoose from 'mongoose';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { UsersService } from '../users/services/users.service';
import { VerifyContractCodeDto } from './dto/verify-contract-code.dto';
import { RedisService } from '../redis/redis.service';
import { RedisPrefixEnum } from '../redis/redis.prefix.enum';

@Injectable()
export class ContractService extends CrudService<ContractDocument> {
  constructor(
    private contractRepositoryImpl: ContractRepositoryImpl,
    private readonly redisService: RedisService,
  ) {
    super(contractRepositoryImpl);
  }
  async findWithAggregation(query: GetQueryDto) {
    let pipeline = [];
    let sort = null;
    let filters = null;

    if (query.filters) {
      filters = JSON.parse(query.filters);
      const contractMatch = Object.entries(filters)
        .filter(([key]) => !key.startsWith('user.'))
        .map(([key, value]) => ({ [key]: value }));

      const userMatch = Object.entries(filters)
        .filter(([key]) => key.startsWith('user.'))
        .map(([key, value]) => {
          if (key === 'user.id' || key === 'user._id') {
            value = new mongoose.Types.ObjectId(value as string);
            key = 'user._id';
          }

          if (key.endsWith('.$or')) {
            return { $or: value };
          } else {
            return { [key]: value };
          }
        });

      if (contractMatch.length > 0)
        pipeline.push({ $match: { $and: contractMatch } });
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      });
      pipeline.push({
        $unwind: '$user',
      });
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'approvers.userId',
          foreignField: '_id',
          as: 'approverUsers',
        },
      });
      pipeline.push({
        $project: {
          'approverUsers.nationalCode': 0,
          'approverUsers.email': 0,
          'approverUsers.phoneNo': 0,
          'approverUsers.branchId': 0,
          'approverUsers.metadata': 0,
          'approverUsers.bankAccountNumber': 0,
          'approverUsers.bankCardNumber': 0,
          'approverUsers.bankSheba': 0,
          'approverUsers.bankAccountOwner': 0,
          'approverUsers.sepidarId': 0,
          'approverUsers.credit': 0,
          'approverUsers.postalCode': 0,
          'approverUsers.address': 0,
          'approverUsers.isActive': 0,
          'approverUsers.type': 0,
          'approverUsers.groups': 0,
        },
      });

      if (userMatch.length > 0) pipeline.push({ $match: { $and: userMatch } });
    } else {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      });
      pipeline.push({
        $unwind: '$user',
      });
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'approvers.userId',
          foreignField: '_id',
          as: 'approverUsers',
        },
      });
      pipeline.push({
        $project: {
          'approverUsers.password': 0,
          'approverUsers.phoneValidated': 0,
          'approverUsers.setPassword': 0,
          'approverUsers.username': 0,
          'approverUsers.nationalCode': 0,
          'approverUsers.email': 0,
          'approverUsers.phoneNo': 0,
          'approverUsers.branchId': 0,
          'approverUsers.metadata': 0,
          'approverUsers.bankAccountNumber': 0,
          'approverUsers.bankCardNumber': 0,
          'approverUsers.bankSheba': 0,
          'approverUsers.bankAccountOwner': 0,
          'approverUsers.sepidarId': 0,
          'approverUsers.credit': 0,
          'approverUsers.postalCode': 0,
          'approverUsers.address': 0,
          'approverUsers.isActive': 0,
          'approverUsers.type': 0,
          'approverUsers.groups': 0,
        },
      });
    }

    if (query.sort) {
      sort = JSON.parse(query.sort);
      pipeline.push({
        $sort: sort,
      });
    }
    pipeline = pipeline.concat([
      {
        $facet: {
          metadata: [{ $count: 'count' }],
          contracts: [
            { $skip: query.size * query.page },
            { $limit: query.size },
          ],
        },
      },
      {
        $project: {
          count: { $arrayElemAt: ['$metadata.count', 0] },
          contracts: 1,
        },
      },
    ]);

    return this.contractRepositoryImpl.findWithAggregation(pipeline);
  }

  async verifyContractCode(verifyContractCodeDto: VerifyContractCodeDto) {
    const { phone, code } = verifyContractCodeDto;
    const storedCode = await this.redisService.getVerificationCodeDynamicPrefix(
      RedisPrefixEnum.CONTRACT_VERIFICATION_CODE,
      phone,
    );
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('Invalid Code');
    }
    return storedCode === code;
  }
}
