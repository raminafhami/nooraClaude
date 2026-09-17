import {
  ProjectionType,
  FilterQuery,
  SortValues,
  Model,
  PipelineStage,
  UpdateWriteOpResult,
  ClientSession,
} from 'mongoose';
import { BaseRepository } from './base.repository';

export abstract class BaseRepositoryImpl<T> implements BaseRepository<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async startSession(): Promise<ClientSession> {
    return this.model.db.startSession();
  }

  async findWithOutPagination(
    where?: FilterQuery<T>,
    populate?: string,
    projection?: string,
  ): Promise<T[]> {
    if (projection) {
      return this.model
        .find(where)
        .select(projection)
        .populate(populate)
        .allowDiskUse(true)
        .exec();
    }
    return this.model.find(where).populate(populate).allowDiskUse(true).exec();
  }

  async find(
    where?: FilterQuery<T>,
    projection?: ProjectionType<T>,
    page?: number,
    limit?: number,
    sort?: string | { [key: string]: SortValues },
    populate?: any,
  ): Promise<T[]> {
    let mongoQuery = this.model.find(where, projection).populate(populate);
    if (page !== undefined && limit !== undefined) {
      mongoQuery = mongoQuery.skip(page * limit).limit(limit);
    }
    if (sort) {
      mongoQuery = mongoQuery.sort(sort);
    }
    mongoQuery.allowDiskUse(true);
    return mongoQuery.exec();
  }

  async findOne(
    where: FilterQuery<T>,
    projection?: ProjectionType<T>,
    populate?: any,
  ) {
    if (populate) {
      return this.model.findOne(where, projection).populate(populate).exec();
    } else {
      return this.model.findOne(where, projection).exec();
    }
  }

  async findById(id: string, populate?: any): Promise<any> {
    if (populate) {
      return this.model.findById(id).populate(populate).exec();
    } else {
      return this.model.findById(id).exec();
    }
  }

  async create(data: any, session?: ClientSession): Promise<any> {
    if (session && !Array.isArray(data)) data = [data];

    if (session) return this.model.create(data, { session });
    return this.model.create(data);
  }

  async updateById(
    id: any,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    if (session)
      return this.model.updateOne({ _id: id }, data, { session }).exec();
    return this.model.updateOne({ _id: id }, data).exec();
  }

  async updateOne(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    if (session) return this.model.updateOne(where, data, { session }).exec();
    return this.model.updateOne(where, data).exec();
  }

  async updateMany(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<unknown> {
    if (session) return this.model.updateMany(where, data, { session }).exec();
    return this.model.updateMany(where, data).exec();
  }

  async deleteMany(where: FilterQuery<T>): Promise<unknown> {
    return this.model.deleteMany(where).exec();
  }

  async findByIdAndUpdate(
    id: any,
    data: Partial<unknown>,
    session?: ClientSession,
  ): Promise<any> {
    if (session)
      return this.model
        .findByIdAndUpdate(id, data, { new: true, session })
        .exec();
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async findOneAndUpdate(
    where: FilterQuery<T>,
    data: Partial<unknown>,
    upsert = false,
    session?: ClientSession,
  ): Promise<any> {
    if (session)
      return this.model
        .findOneAndUpdate(where, data, { new: true, upsert, session })
        .exec();
    return this.model
      .findOneAndUpdate(where, data, { new: true, upsert })
      .exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id }).exec();

    return result.deletedCount > 0;
  }

  async deleteOne(where: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.deleteOne(where).exec();

    return result.deletedCount > 0;
  }

  async count(where: FilterQuery<T>): Promise<any> {
    return this.model.count(where).exec();
  }

  async aggregate(pipeline: any[], options: any = {}): Promise<any> {
    return this.model.aggregate(pipeline, options).allowDiskUse(true).exec();
  }
}
