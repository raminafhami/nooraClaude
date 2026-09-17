import {
  ClientSession,
  FilterQuery,
  ProjectionType,
  Types,
  UpdateWriteOpResult,
  isObjectIdOrHexString,
  isValidObjectId,
} from 'mongoose';
import { BaseRepositoryImpl } from '../repositories/base-repository.impl';
import { BaseSchema } from '../repositories/base.schema';
import { GetQueryDto } from '../dto/get-query.dto';
import { CustomMessages } from 'src/common/const/custom-messages';
import CustomError from 'src/common/providers/custom-error';
import { HttpStatus } from '@nestjs/common';

export abstract class CrudService<T extends BaseSchema> {
  constructor(private readonly repository: BaseRepositoryImpl<T>) {}

  async findWithOutPagination(
    where?: FilterQuery<T>,
    populate?: string,
    projection?: string,
  ): Promise<T[]> {
    return this.repository.findWithOutPagination(where, populate, projection);
  }

  async findAll(query: GetQueryDto) {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    if (condition.$and.length == 0) {
      condition = {};
    }

    const count = await this.repository.count(condition);
    const data = await this.repository.find(
      condition,
      query?.projection,
      query.page,
      query.size,
      sort,
      query.populate,
    );
    return { data, count };
  }

  async findAllWithAggregate(query: GetQueryDto) {
    let pipeline = [];
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        ...query.projection,
      },
    });
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        filters = Object.entries(filters).map(([key, value]) => {
          // if (key === '_id') {
          //   value = Array.isArray(value)
          //     ? value.map((v) => new Types.ObjectId(v))
          //     : new Types.ObjectId(value as string);
          // }
          return { [key]: value };
        });

        if (filters) pipeline.push({ $match: { $and: filters } });
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
        pipeline.push({
          $sort: sort,
        });
      }
    } catch (err) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    pipeline = pipeline.concat([
      {
        $facet: {
          metadata: [{ $count: 'count' }],
          data: [{ $skip: query.size * query.page }, { $limit: query.size }],
        },
      },
      {
        $project: {
          count: { $arrayElemAt: ['$metadata.count', 0] },
          data: 1,
        },
      },
    ]);
    const [result] = await this.aggregate(pipeline);

    result.count = result?.count ? result.count : 0;
    return result;
  }

  //todo edit this
  // async findAllWithAggregateNew(query: GetQueryDto) {
  //   let pipeline = [];
  //   pipeline.push({
  //     $project: {
  //       _id: 0,
  //       id: '$_id',
  //       ...query.projection,
  //     },
  //   });
  //   let sort = null;
  //   let filters = null;
  //   try {
  //     if (query.filters) {
  //       filters = JSON.parse(query.filters);
  //       filters = Object.entries(filters).map(([key, value]) => {
  //         // if (key === '_id') {
  //         //   value = Array.isArray(value)
  //         //     ? value.map((v) => new Types.ObjectId(v))
  //         //     : new Types.ObjectId(value as string);
  //         // }
  //         return { [key]: value };
  //       });

  //       if (filters) pipeline.push({ $match: { $and: filters } });
  //     }

  //     if (query.sort) {
  //       sort = JSON.parse(query.sort);
  //       pipeline.push({
  //         $sort: sort,
  //       });
  //     }
  //   } catch (err) {
  //     throw new CustomError(
  //       HttpStatus.BAD_REQUEST,
  //       ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
  //     );
  //   }

  //   pipeline = pipeline.concat([
  //     {
  //       $facet: {
  //         metadata: [{ $count: 'count' }],
  //         data: [{ $skip: query.size * query.page }, { $limit: query.size }],
  //       },
  //     },
  //     {
  //       $project: {
  //         count: { $arrayElemAt: ['$metadata.count', 0] },
  //         data: 1,
  //       },
  //     },
  //   ]);
  //   const [result] = await this.aggregate(pipeline);

  //   result.count = result?.count ? result.count : 0;
  //   return result;
  // }

  async findWithAggregate(query: GetQueryDto) {
    const pipeline = [];
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        ...query.projection,
      },
    });
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        filters = Object.entries(filters).map(([key, value]) => ({
          [key]: value,
        }));
        if (filters) pipeline.push({ $match: { $and: filters } });
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
        pipeline.push({
          $sort: sort,
        });
      }
    } catch (err) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    const result = await this.aggregate(pipeline);

    return result;
  }

  isCouldbeObjectId(str) {
    if (typeof str === 'string') {
      return /^[a-f\d]{24}$/i.test(str);
    } else if (Array.isArray(str)) {
      return str.every((arrStr) => /^[a-f\d]{24}$/i.test(arrStr));
    }
    return false;
  }

  convertToObjectId$or(query) {
    /* eslint-disable no-param-reassign */
    if (typeof query !== 'object' || Array.isArray(query)) {
      return query;
    }

    return Object.keys(query).reduce((curr: any, subKey) => {
      console.log(this.isCouldbeObjectId(query[subKey]));

      if (this.isCouldbeObjectId(query[subKey])) {
        query[subKey] = Array.isArray(query[subKey])
          ? query[subKey].map((v) => new Types.ObjectId(v))
          : new Types.ObjectId(query[subKey]);
      } else if (
        typeof query[subKey] === 'object' &&
        query[subKey].$in &&
        this.isCouldbeObjectId(query[subKey].$in)
      ) {
        // Is an array of strings similar to ObjectId
        // or an string similar to ObjectId
        let multiMatch;
        const $or = [];

        multiMatch = {};
        multiMatch[subKey] = query[subKey];
        $or.push(multiMatch);

        multiMatch = {};
        multiMatch[subKey] = {
          $in: query[subKey].$in.map((v) => new Types.ObjectId(v)),
        };
        $or.push(multiMatch);

        if (curr.$and) {
          curr.$and.push({ $or });
        } else if (curr.$or) {
          curr.$and = [{ $or: curr.$or }, { $or }];
          delete curr.$or;
        } else {
          curr.$or = $or;
        }
      } else if (
        typeof query[subKey] === 'object' &&
        !Array.isArray(query[subKey])
      ) {
        curr[subKey] = this.convertToObjectId$or(query[subKey]);
      } else if (
        typeof query[subKey] === 'object' &&
        Array.isArray(query[subKey])
      ) {
        const a = query[subKey].map((q) => this.convertToObjectId$or(q));

        curr[subKey] = a;
      } else {
        curr[subKey] = query[subKey];
      }
      return curr;
    }, {});
    /* eslint-enable no-param-reassign */
  }

  async find(query: GetQueryDto): Promise<any> {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    if (condition.$and.length == 0) {
      condition = {};
    }
    return this.repository.find(
      condition,
      query?.projection,
      null,
      null,
      sort,
      query.populate,
    );
  }

  async findOne(
    where: FilterQuery<T>,
    projection?: ProjectionType<T>,
    populate?: any,
  ): Promise<any> {
    return this.repository.findOne(where, projection, populate);
  }

  async findById(id: any, populate?: any): Promise<T> {
    return this.repository.findById(id, populate);
  }

  async create(data: any, session?: ClientSession): Promise<any> {
    return this.repository.create(data, session);
  }

  async updateById(
    id: any,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    return this.repository.updateById(id, data, session);
  }

  async updateOne(
    where: FilterQuery<T>,
    data: Partial<unknown>,
  ): Promise<UpdateWriteOpResult> {
    return this.repository.updateOne(where, data);
  }

  async updateMany(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<any> {
    return this.repository.updateMany(where, data, session);
  }

  async deleteMany(where: FilterQuery<T>): Promise<any> {
    return this.repository.deleteMany(where);
  }

  async findByIdAndUpdate(
    id: any,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<any> {
    return this.repository.findByIdAndUpdate(id, data, session);
  }

  async findOneAndUpdate(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    upsert = false,
  ): Promise<any> {
    return this.repository.findOneAndUpdate(where, data, upsert);
  }

  async deleteById(id: string): Promise<boolean> {
    return this.repository.deleteById(id);
  }

  async softDeleteById(id: string): Promise<boolean> {
    const data = await this.repository.updateById(id, { isDeleted: true });
    return !!data.modifiedCount;
  }

  async deleteOne(where: FilterQuery<T>): Promise<boolean> {
    return this.repository.deleteOne(where);
  }

  async count(where: FilterQuery<T>): Promise<any> {
    return this.repository.count(where);
  }

  async aggregate(pipeline: any[]): Promise<any> {
    return this.repository.aggregate(pipeline);
  }
  // GET http://localhost:3000/users/search?q={ "orders.id": "6539f8ab2b11c0674d9dd1a5" ,"$or":[{"_id":"6539f8ab2b11c0674d9dd1a5"},{"users.id":"6539f8ab2b11c0674d9dd1a5"}]}
  async aggregateByDynamicFilter(query: GetQueryDto): Promise<any> {
    const filters = this.convertObjectIds(JSON.parse(query.filters || '{}'));

    const aggregatePipeline = [];
    const match: any = {};
    const andConditions = [];
    const orConditions = [];

    Object.keys(filters).forEach((key) => {
      if (key === '$or') {
        filters[key].forEach((condition: any) => {
          const orCondition: any = {};
          Object.keys(condition).forEach((innerKey) => {
            orCondition[innerKey] = this.buildCondition(condition[innerKey]);
          });
          orConditions.push(orCondition);
        });
      } else {
        const condition = {};

        condition[key] = this.buildCondition(filters[key]);
        andConditions.push(condition);
      }
    });

    if (andConditions.length > 0) {
      match['$and'] = andConditions;
    }

    if (orConditions.length > 0) {
      match['$or'] = orConditions;
    }

    if (query.populate.length != 0) {
      aggregatePipeline.push(...query.populate);
    }

    if (Object.keys(match).length > 0) {
      aggregatePipeline.push({
        $match: match,
      });
    }

    if (query?.sort) {
      query.sort = JSON.parse(query?.sort);
      aggregatePipeline.push({
        $sort: query.sort,
      });
    }
    const options = {
      collation: { locale: 'fa', strength: 2, numericOrdering: true }, // Example collation, adjust as needed
    };
    aggregatePipeline.push(
      {
        $facet: {
          metadata: [{ $count: 'count' }],
          data: [{ $skip: query.size * query.page }, { $limit: query.size }],
        },
      },
      {
        $project: {
          count: { $arrayElemAt: ['$metadata.count', 0] },
          data: 1,
        },
      },
    );

    return this.repository.aggregate(aggregatePipeline, options);
  }

  private buildCondition(filter: any) {
    if (
      typeof filter === 'object' &&
      !Array.isArray(filter) &&
      !isValidObjectId(filter)
    ) {
      const condition = {};

      Object.keys(filter).forEach((operator) => {
        if (operator === '$regex') {
          condition[`$regex`] = filter[operator];
          // condition[`$options`] = 'i'; // Case-insensitive
        } else if (operator === '$in') {
          condition[`$in`] = filter[operator];
        } else if (operator === '$nin') {
          condition[`$nin`] = filter[operator];
        } else if (operator === '$gt') {
          condition[`$gt`] = filter[operator];
        } else if (operator === '$gte') {
          condition[`$gte`] = filter[operator];
        } else if (operator === '$lt') {
          condition[`$lt`] = filter[operator];
        } else if (operator === '$lte') {
          condition[`$lte`] = filter[operator];
        } else if (operator === '$ne') {
          condition[`$ne`] = filter[operator];
        } else if (operator === '$exists') {
          condition[`$exists`] = filter[operator];
        } else if (operator === '$all') {
          condition[`$all`] = filter[operator];
        } else if (operator === '$size') {
          condition[`$size`] = filter[operator];
        } else if (operator === '$elemMatch') {
          condition[`$elemMatch`] = this.buildCondition(filter[operator]);
        } else if (operator === '$options') {
          condition[`$options`] = filter[operator];
        } else {
          condition[`${operator}`] = this.buildCondition(filter[operator]);
          // condition[`$${operator}`] = filter[operator];
        }
      });
      return condition;
    } else {
      Object.entries(filter).forEach(([key, criteria]) => {
        Object.entries(criteria).forEach(([field, elem]) => {
          Object.entries(elem).forEach(([operator, e]) => {
            if (typeof e === 'string' && e.startsWith('$date')) {
              let convertedDate: string | Date = e
                .replace('$date', '')
                .replaceAll("'", '');
              convertedDate = new Date(convertedDate);

              filter.forEach((filter: any) => {
                if (filter[field] && filter[field][operator] === e) {
                  filter[field][operator] = convertedDate;
                }
              });
            }
          });
        });
      });
      return filter;
    }
  }
  private convertObjectIds(obj: any): any {
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          let newKey = key;
          if (key === 'id') {
            newKey = '_id';
          } else if (key.includes('.id')) {
            newKey = key.replace('.id', '._id');
          }

          if (typeof obj[key] === 'string' && isObjectIdOrHexString(obj[key])) {
            obj[newKey] = new Types.ObjectId(obj[key]);
          } else if (typeof obj[key] === 'object' || Array.isArray(obj[key])) {
            obj[newKey] = this.convertObjectIds(obj[key]);
          } else {
            obj[newKey] = obj[key];
          }

          if (newKey !== key) {
            delete obj[key];
          }
        }
      }
    } else if (Array.isArray(obj)) {
      obj = obj.map((item) => this.convertObjectIds(item));
    }
    return obj;
  }
}
