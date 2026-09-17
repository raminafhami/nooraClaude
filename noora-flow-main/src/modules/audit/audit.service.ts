import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { AuditDocument } from './schemas/audit.schema';
import { AuditRepositoryImpl } from './repository/audit.repository';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuditService extends CrudService<AuditDocument> {
  constructor(private readonly auditRepositoryImpl: AuditRepositoryImpl) {
    super(auditRepositoryImpl);
  }

  async getAudits(queryDto: GetQueryDto) {
    const populates = [];
    const userProjectionFields = {
      id: '$_id',
      _id: 1,
      name: 1,
      lastname: 1,
      username: 1,
      branchId: 1,
    };
    populates.push(
      {
        $lookup: {
          from: 'users',
          let: { approverId: '$approverId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$approverId'],
                },
              },
            },
            {
              $project: userProjectionFields,
            },
          ],
          as: 'approver',
        },
      },
      {
        $unwind: {
          path: '$approver',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { seconderId: '$seconderId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$seconderId'],
                },
              },
            },
            {
              $project: userProjectionFields,
            },
          ],
          as: 'seconder',
        },
      },
      {
        $unwind: {
          path: '$seconder',
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { producerId: '$producerId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$producerId'],
                },
              },
            },
            {
              $project: userProjectionFields,
            },
          ],
          as: 'producer',
        },
      },
      {
        $unwind: {
          path: '$producer',
        },
      },
    );
    if (queryDto.populate.includes('users')) {
      populates.push({
        $lookup: {
          from: 'users',
          let: { userIds: '$users' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', { $ifNull: ['$$userIds', []] }] },
              },
            },
            { $project: userProjectionFields },
          ],
          as: 'users',
        },
      });
    }
    if (queryDto.populate.includes('userGroups')) {
      populates.push({
        $lookup: {
          from: 'usergroups',
          let: { userGroupIds: '$userGroups' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', { $ifNull: ['$$userGroupIds', []] }] },
              },
            },
            { $project: { id: '$_id', _id: 1, name: 1, title: 1, type: 1 } },
          ],
          as: 'userGroups',
        },
      });
    }
    queryDto.populate = populates;
    const [result] = await this.aggregateByDynamicFilter(queryDto);
    result.data = result.data.map((d) => {
      d.id = d._id;
      delete d._id;
      return d;
    });
    result.count = result?.count ? result.count : 0;
    return result;
  }
}
