import { Injectable } from '@nestjs/common';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Category, CategoryDocument } from '../entity/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepositoryImpl extends BaseRepositoryImpl<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    protected auditModel: Model<CategoryDocument>,
  ) {
    super(auditModel);
  }
}
