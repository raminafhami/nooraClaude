import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryTypes } from 'src/common/const/enums';
import { CategoryBudgetService } from '../category-budget/category-budget.service';

@Controller('category')
@ApiTags('Category')
@ApiBearerAuth('token')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryBudgetService: CategoryBudgetService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.CATEGORIES,
  })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CATEGORIES,
  })
  @Get()
  async get(@Query() getQueryDto: GetQueryDto) {
    let filters = getQueryDto.filters || '{}';
    filters = JSON.parse(filters);
    filters['isHidden'] = false;
    getQueryDto.filters = JSON.stringify(filters);
    return this.categoryService.findAll(getQueryDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CATEGORIES,
  })
  @Get('budget-amount')
  async getCategoryBasedOnBudget(@Query() getQuery: GetQueryDto) {
    const filter = JSON.parse(getQuery.filters || '{}');
    filter.isHidden = false;
    filter.type = CategoryTypes.Petty;
    filter.parentId = { $exists: false };
    getQuery.filters = JSON.stringify(filter);
    const categories = await this.categoryService.findAll(getQuery);
    if (!categories.data.length) return [];

    const now = new Date();
    const batchSize = 10;
    const result = [];

    const processBatch = async (batch: any[]) => {
      const batchResults = await Promise.all(
        batch.map(async (category) => {
          const filters = {
            $and: [{ categoryId: category._id }, { isActive: true }],
          };

          const getQueryDto: GetQueryDto = new GetQueryDto();
          getQueryDto.filters = JSON.stringify(filters);

          const categoryBudgets =
            await this.categoryBudgetService.getCategoryBudgets(getQueryDto);

          const activeBudget = categoryBudgets.data.find((budget) => {
            const to = new Date(budget.dateTo);
            return now <= to;
          });

          return {
            ...category.toObject(),
            budgetName: activeBudget ? activeBudget.name : '',
            amount: activeBudget ? activeBudget.amount : 0,
            remain: activeBudget ? activeBudget.remain : 0,
            dateTo: activeBudget ? activeBudget.dateTo : '',
            dateFrom: activeBudget ? activeBudget.dateFrom : '',
          };
        }),
      );
      result.push(...batchResults);
    };

    for (let i = 0; i < categories.data.length; i += batchSize) {
      const batch = categories.data.slice(i, i + batchSize);
      await processBatch(batch);
    }

    return {
      data:result,
      count: categories.count
    };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.CATEGORIES,
  })
  @Patch(':categoryId')
  async update(
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(categoryId, updateCategoryDto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.CATEGORIES,
  })
  @Delete(':categoryId')
  async delete(@Param('categoryId') categoryId: string) {
    return this.categoryService.categorySoftDelete(categoryId);
  }
}
