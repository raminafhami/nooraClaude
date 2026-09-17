import { Injectable, Logger } from '@nestjs/common';

import { CrudService } from 'src/shared/crud/service/crud.service';
import { BuyerDocument } from '../schemas/buyer.schema';
import { BuyerRepositoryImpl } from '../repository/buyer.repository';
import { GetQueryDto } from 'src/modules/process-instances/dtos';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';

@Injectable()
export class BuyerService extends CrudService<BuyerDocument> {
  constructor(private buyerRepositoryImpl: BuyerRepositoryImpl) {
    super(buyerRepositoryImpl);
  }

  async getMembersOfBuyer(queryDto: GetQueryDto, user: ActiveUserData) {
    const populates = [];
    populates.push(
      {
        $lookup: {
          from: 'userbuyers',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$buyerId', '$$id'] },  
                    ...(user.branchId ? [{ $eq: ['$branchId', user.branchId] }] : [])
                  ]
                }
              }
            }
          ],
          as: 'userBuyer',
        },
      },
      {
        $unwind: {
          path: '$userBuyer',
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userBuyer.userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $lookup: {
          from: 'usergroups',
          let: { branchId: '$userBuyer.branchId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$branchId'],
                },
              },
            },
            {
              $project:{
                title:1,
                name:1,
                _id:1
              }
            }
          ],
          as: 'branch',
        },
      },
      {
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true
        },
      },
      {
        $project:{
          user:1 , 
          userId: "$userBuyer.userId",
          buyerId:"$userBuyer.buyerId",
          role: "$userBuyer.role",
          isConnector: "$userBuyer.isConnector",
          isActive:"$userBuyer.isActive",
          id : "$userBuyer._id",
          branch:1,

        }
      }
    );

    queryDto.populate = populates;
    const [result] = await this.aggregateByDynamicFilter(queryDto);
    result.data = result.data.map((d) => {
      delete d._id;
      return d;
    }).filter((d) => Object.keys(d).length > 0);
    return result.data;
  }
}
