import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CategoryBudgetDocument } from './schemas/category-budget.schema.js';
import { CategoryBudgetRepositoryImpl } from './repositories/category-budget.repository.js';
import { PettyCostStatus } from 'src/common/const/enums';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto.js';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto.js';
import { GetQueryDto } from '../process-instances/dtos/index.js';
import { PettyCostService } from '../petty-costs/petty-cost.service.js';
import mongoose from 'mongoose';
import { CategoryService } from '../categories/category.service.js';
import { InspectionCostsService } from '../inspection-costs/inspection-costs.service.js';

@Injectable()
export class CategoryBudgetService extends CrudService<CategoryBudgetDocument> {
  constructor(
    private readonly categoryBudgetRepositoryImpl: CategoryBudgetRepositoryImpl,
    @Inject(forwardRef(() => PettyCostService))
    private readonly pettyCostService: PettyCostService,
    private readonly categoryService: CategoryService,
    private readonly inspectionCostService: InspectionCostsService,
  ) {
    super(categoryBudgetRepositoryImpl);
  }

  async createCategoryBudget(createCategoryBudgetDto: CreateCategoryBudgetDto) {
    const { dateFrom, dateTo, categoryId } = createCategoryBudgetDto;

    const category = await this.categoryService.findOne({
      _id: categoryId,
      isDeleted: false,
    });
    if (!category) {
      throw new BadRequestException('category not found');
    }

    if (category.parentId) {
      throw new BadRequestException(
        'you cannot set CategoryBudget for sub-category',
      );
    }

    //check time overlap
    const overlappingCategoryBudgets =
      await this.categoryBudgetRepositoryImpl.findWithOutPagination({
        categoryId,
        isActive: true,
        $or: [
          {
            dateFrom: { $lte: dateTo },
            dateTo: { $gte: dateFrom },
          },
        ],
      });

    if (overlappingCategoryBudgets.length > 0) {
      throw new BadRequestException(
        'You have an active categoryBudget in this time range!',
      );
    }

    return await this.categoryBudgetRepositoryImpl.create(
      createCategoryBudgetDto,
    );
  }

  async updateCategoryBudget(
    id: string,
    updateCategoryBudgetDto: UpdateCategoryBudgetDto,
  ) {
    const categoryBudget = await this.categoryBudgetRepositoryImpl.findById(id);
    if (!categoryBudget) {
      throw new NotFoundException('CategoryBudget not found !');
    }

    return await this.categoryBudgetRepositoryImpl.findByIdAndUpdate(
      id,
      updateCategoryBudgetDto,
    );
  }

  async getCategoryBudgets(queryDto: GetQueryDto) {
    const { filters, page, populate, size, sort } = queryDto;

    const [categoryBudgets, count] = await Promise.all([
      this.categoryBudgetRepositoryImpl.find(
        filters ? JSON.parse(filters) : null,
        null,
        page,
        size,
        sort,
        populate,
      ),
      this.categoryBudgetRepositoryImpl.count(
        filters ? JSON.parse(filters) : null,
      ),
    ]);

    const categoryBudgetIds = categoryBudgets.map(
      (e) => new mongoose.Types.ObjectId(e._id),
    );
    const [pettyCosts, inspectionCosts] = await Promise.all([
      this.pettyCostService.aggregate([
        {
          $match: {
            categoryBudgetId: { $in: categoryBudgetIds },
            status: PettyCostStatus.PAID,
          },
        },
        {
          $group: {
            _id: '$categoryBudgetId',
            totalSpentAmount: { $sum: { $add: ['$total', '$vat'] } },
          },
        },
      ]),
      this.inspectionCostService.aggregate([
        {
          $match: {
            categoryBudgetId: { $in: categoryBudgetIds },
            status: PettyCostStatus.PAID,
          },
        },
        {
          $group: {
            _id: '$categoryBudgetId',
            totalSpentAmount: { $sum: { $toInt: '$total' } },
          },
        },
      ]),
    ]);

    const pettyCostMap = new Map<string, number>();
    for (const cost of pettyCosts) {
      pettyCostMap.set(cost._id.toString(), cost.totalSpentAmount);
    }
    const inspectionCostMap = new Map<string, number>();
    for (const cost of inspectionCosts) {
      inspectionCostMap.set(cost._id.toString(), cost.totalSpentAmount);
    }

    const data = categoryBudgets.map((category: any) => {
      const obj = category.toObject();
      const pettySpent = pettyCostMap.get(category.id) || 0;
      const inspectionSpent = inspectionCostMap.get(category.id) || 0;

      return {
        ...obj,
        remain: pettySpent
          ? obj.amount - pettySpent
          : inspectionSpent
          ? obj.amount - inspectionSpent
          : obj.amount,
      };
    });

    return { data, count };
  }

  async validateCategoryBudget(categoryId: string, spentDate: string) {
    const category = await this.categoryService.findOne({
      _id: categoryId,
      isDeleted: false,
    });
    if (!category) {
      throw new BadRequestException('category not found');
    }
    const categoryBudget: any =
      await this.categoryBudgetRepositoryImpl.findWithOutPagination({
        categoryId: category.parentId,
        isActive: true,
        dateFrom: { $lte: spentDate },
        dateTo: { $gte: spentDate },
      });
    if (!categoryBudget.length) {
      throw new BadRequestException(
        'You do not have any active category budget.',
      );
    }
    return categoryBudget[0];
  }
}
