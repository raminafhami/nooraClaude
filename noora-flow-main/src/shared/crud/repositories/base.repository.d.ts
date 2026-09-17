import {
  FilterQuery,
  ProjectionType,
  SortValues,
  UpdateWriteOpResult,
} from 'mongoose';

export interface BaseRepository<T> {
  findWithOutPagination(
    where?: FilterQuery<T>,
    populate?: string,
  ): Promise<T[]>;
  find(
    where?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    page?: number,
    limit?: number,
    sort?: string | { [key: string]: SortValues },
    populate?: any,
  ): Promise<any>;
  findOne(
    where: FilterQuery<T>,
    projection?: ProjectionType<T>,
    populate?: any,
  ): Promise<any>;

  findById(id: any, populate?: any): Promise<any>;

  create(data: any): Promise<any>;

  updateById(id: any, data: Partial<unknown>): Promise<UpdateWriteOpResult>;

  updateOne(
    where: FilterQuery<T>,
    data: Partial<unknown>,
  ): Promise<UpdateWriteOpResult>;

  findByIdAndUpdate(id: any, data: Partial<unknown>): Promise<any>;

  findOneAndUpdate(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    upsert?: boolean,
  ): Promise<any>;

  deleteById(id: string): Promise<boolean>;

  deleteOne(where: FilterQuery<T>): Promise<boolean>;

  count(where: FilterQuery<T>): Promise<any>;

  aggregate(pipeline: any[]): Promise<any>;
}
