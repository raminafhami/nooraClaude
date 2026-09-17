import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PettyCashDocument } from './schemas/petty-cash.schema';
import { PettyCashRepositoryImpl } from './repositories/petty-cash.repository';
import { CreatePettyCashDto } from './dto/create-petty-cash.dto';
import { PettyCostService } from '../petty-costs/petty-cost.service';
import { CategoryService } from '../categories/category.service';
import { CategoryBudgetService } from '../category-budget/category-budget.service';
import { UpdatePettyCashDto } from './dto/update-petty-cash.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CategoryTypes } from 'src/common/const/enums';
import { Pagination } from './dto/get-petty-cash.dto';

@Injectable()
export class PettyCashService extends CrudService<PettyCashDocument> {
  constructor(
    private readonly pettyCashRepositoryImpl: PettyCashRepositoryImpl,
    @Inject(forwardRef(() => CategoryBudgetService))
    private readonly categoryBudgetService: CategoryBudgetService,
    @Inject(forwardRef(() => PettyCostService))
    private readonly pettyCostService: PettyCostService,
    private readonly categoryService: CategoryService,
  ) {
    super(pettyCashRepositoryImpl);
  }

  async createPettyCash(createPettyCashDto: CreatePettyCashDto) {
    const now = new Date();

    const categories = await this.categoryService.findWithOutPagination({
      _id: createPettyCashDto.categoryIds,
      isDeleted: false,
    });
    if (categories.length !== createPettyCashDto.categoryIds.length) {
      throw new BadRequestException('Some category IDs are invalid or deleted');
    }

    const parentIds = categories.flatMap((category: any) => category.parentId);

    const categoryBudgets =
      await this.categoryBudgetService.findWithOutPagination({
        categoryId: parentIds,
        isActive: true,
      });
    if (!categoryBudgets.length) {
      throw new BadRequestException('there is not any active category-budget');
    }
    const budgetedParentIds = categoryBudgets.map((b) =>
      b.categoryId.toString(),
    );
    const missingParentIds = parentIds.filter(
      (id) => !budgetedParentIds.includes(id.toString()),
    );

    if (missingParentIds.length) {
      throw new BadRequestException(
        `No active category budget found for parent category IDs: ${missingParentIds.join(
          ', ',
        )}`,
      );
    }

    for (const budget of categoryBudgets) {
      // const from = new Date(budget.dateFrom);
      const to = new Date(budget.dateTo);

      if (now > to) {
        throw new BadRequestException(
          `The ${budget.name} budget allocation period has expired.`,
        );
      }
    }

    return await this.pettyCashRepositoryImpl.create({
      ...createPettyCashDto,
      remain: createPettyCashDto.amount,
    });
  }

  async deletePettyCash(id: string) {
    const pettyCosts = await this.pettyCostService.findOne({
      'pettyCashInfo.pettyCashId': { $in: id },
    });
    if (pettyCosts) {
      throw new BadRequestException(
        'delete failed. This petty cash has at least one petty cost',
      );
    }
    return this.pettyCashRepositoryImpl.deleteOne({ _id: id });
  }

  async updatePettyCash(cashId: string, updateDto: UpdatePettyCashDto) {
    const cash = await this.pettyCashRepositoryImpl.findById(cashId);

    if (!cash) {
      throw new BadRequestException('PettyCash not found');
    }
    if (updateDto.amount && cash.amount >= updateDto.amount) {
      throw new BadRequestException('You cannot reduce the pettyCash amount');
    }
    if (updateDto.categoryIds) {
      const existingIds = cash.categoryIds.map(id => id.toString());
      const incomingIds = updateDto.categoryIds.map(id => id.toString());
    
      const newOnes = incomingIds.filter(id => !existingIds.includes(id));
      const mergedIds = [...existingIds, ...newOnes];
    
      updateDto.categoryIds = mergedIds;
    }

    if (updateDto.amount && cash.amount < updateDto.amount) {
      const diff = updateDto.amount - cash.amount;
      return await this.pettyCashRepositoryImpl.updateById(cashId, {
        ...updateDto,
        remain: cash.remain + diff,
      });
    }
    return await this.pettyCashRepositoryImpl.updateById(cashId, updateDto);
  }

  async getCategoriesFromPettyCash(userId: string) {
    const pettyCash = await this.pettyCashRepositoryImpl.findWithOutPagination({
      userId: userId,
      isActive: true,
    });

    let categoryIds = [];
    for (const cash of pettyCash) {
      categoryIds.push(
        ...cash.categoryIds.flatMap((category: any) => category),
      );
    }
    const uniqueCategoryIds = [
      ...new Set(categoryIds.map((id) => id.toString())),
    ];
    const categoriesInfo = await this.categoryService.findWithOutPagination(
      {
        _id: uniqueCategoryIds,
        isDeleted: false,
      },
      'parentId',
    );
    return categoriesInfo;
  }

  async getUsersOfCategory(categoryId: string, paginationDto: Pagination) {
    const categories: any = await this.categoryService.findWithOutPagination({
      $and: [
        {
          parentId: categoryId,
          isHidden: false,
          isDeleted: false,
          type: CategoryTypes.Petty,
        },
      ],
    });
    if (!categories.length) return [];
    const categoryIds = categories.flatMap((c) => c.id);

    const users: any = await this.pettyCashRepositoryImpl.findWithOutPagination(
      {
        categoryIds: { $in: categoryIds },
        isActive: true,
      },
      'userId',
    );
    let result = [];
    for (let c of categories) {
      const categoryDocs = c.toObject();

      categoryDocs.users = [];

      for (const user of users) {
        const UserDoc = user.toObject();
        const userName = `${UserDoc.userId.name ?? ''} ${
          UserDoc.userId.lastname ?? ''
        }`.trim();

        if (
          UserDoc.categoryIds.toString().includes(categoryDocs.id) &&
          !categoryDocs.users.includes(userName)
        ) {
          categoryDocs.users.push(userName);
        }
      }
      result.push(categoryDocs);
    }

    const page = paginationDto.page || 0;
    const pageSize = paginationDto.size || 10;
    const totalCount = result.length;

    const paginatedData = result.slice(page * pageSize, (page + 1) * pageSize);

    return {
      count: totalCount,
      data: paginatedData,
    };
  }

  async getCategoriesOfUser(userId: string, paginationDto: Pagination) {
    const data = await this.getCategoriesFromPettyCash(userId);
    const page = paginationDto.page || 0;
    const pageSize = paginationDto.size || 10;
    const totalCount = data.length;

    const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

    return {
      count: totalCount,
      data: paginatedData,
    };
  }
}
