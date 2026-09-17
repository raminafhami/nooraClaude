import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { DispatcherCategoryDocument } from './schemas/dispatcher-category.schema';
import { DispatcherCategoryRepositoryImpl } from './repository/dispatcher-category.repository';

@Injectable()
export class DispatcherCategoryService extends CrudService<DispatcherCategoryDocument> {
  constructor(
    private dispatcherCategoryRepositoryImpl: DispatcherCategoryRepositoryImpl,
  ) {
    super(dispatcherCategoryRepositoryImpl);
  }

  async categorizeCode(code: string): Promise<any[]> {
    const result = await this.dispatcherCategoryRepositoryImpl.model.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$include',
                        as: 'pattern',
                        cond: {
                          $regexMatch: {
                            input: code,
                            regex: '$$pattern',
                          },
                        },
                      },
                    },
                  },
                  0,
                ],
              },
              {
                $eq: [
                  {
                    $size: {
                      $filter: {
                        input: '$exclude',
                        as: 'pattern',
                        cond: {
                          $regexMatch: {
                            input: code,
                            regex: '$$pattern',
                          },
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          type: 1,
          domainCode: 1,
          inspectionDomain: 1,
        },
      },
    ]);

    return result.length > 0 ? result : [];
  }
}
