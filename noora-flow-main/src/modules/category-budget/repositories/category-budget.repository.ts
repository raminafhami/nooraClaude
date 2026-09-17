import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { CategoryBudget, CategoryBudgetDocument } from '../schemas/category-budget.schema';

@Injectable()
export class CategoryBudgetRepositoryImpl extends BaseRepositoryImpl<CategoryBudgetDocument> {
  constructor(
    @InjectModel(CategoryBudget.name)
    protected categoryBudgetModel: Model<CategoryBudgetDocument>,
  ) {
    super(categoryBudgetModel);
  }
}
