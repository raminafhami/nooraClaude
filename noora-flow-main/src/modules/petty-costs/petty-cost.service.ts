import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PettyCostDocument } from './schemas/petty-cost.schema';
import { PettyCostRepositoryImpl } from './repositories/petty-cost.repository';
import { CreatePettyCostDto } from './dto/create-petty-cost.dto';
import { PettyCashService } from '../petty-cash/petty-cash.service';
import { CostTypes, PettyCostStatus } from 'src/common/const/enums';
import { CategoryBudgetService } from '../category-budget/category-budget.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import {
  UpdatePettyCostStatusDto,
  UpdateUnofficialPettyCostDateDto,
  UpdateUnofficialPettyCostDto,
} from './dto/update-petty-cost.dto';
import { DeleteUnofficialCostDto } from './dto/delete-petty-cost.dto';

@Injectable()
export class PettyCostService extends CrudService<PettyCostDocument> {
  constructor(
    private readonly pettyCostRepositoryImpl: PettyCostRepositoryImpl,
    @Inject(forwardRef(() => PettyCashService))
    private readonly pettyCashService: PettyCashService,
    @Inject(forwardRef(() => CategoryBudgetService))
    private readonly categoryBudgetService: CategoryBudgetService,
  ) {
    super(pettyCostRepositoryImpl);
  }

  async createPettyCost(
    createPettyCost: CreatePettyCostDto,
    activeUser: ActiveUserData,
  ) {
    const {
      pettyCashIds,
      categoryId,
      spentDate,
      type,
      amount,
      currencyRate,
      hasVat,
    } = createPettyCost;

    const totalWithVat = amount * currencyRate;
    const total = hasVat ? Math.trunc((totalWithVat * 10) / 11) : totalWithVat;
    const vat = hasVat ? totalWithVat - total : 0;

    let categoryBudget;
    if (categoryId && spentDate) {
      categoryBudget = await this.categoryBudgetService.validateCategoryBudget(
        categoryId,
        spentDate,
      );
    }

    if (type === CostTypes.Official) {
      const pettyCash = pettyCashIds
        ? await this.pettyCashService.findWithOutPagination({
            _id: pettyCashIds,
            isActive: true,
            categoryIds: categoryId,
            userId: activeUser.id,
          })
        : await this.pettyCashService.findWithOutPagination({
            userId: activeUser.id,
            categoryIds: categoryId,
            isActive: true,
          });
      if (!pettyCash?.length) {
        throw new BadRequestException('No petty cash records found.');
      }
      // Try single allocation
      for (const cash of pettyCash) {
        if (cash.remain >= totalWithVat) {
          return this.allocateFromSingleCash(
            cash,
            total,
            totalWithVat,
            vat,
            createPettyCost,
            activeUser.id,
            categoryBudget.id,
          );
        }
      }

      // Try multiple allocation
      const multiAllocation = await this.allocateFromMultipleCash(
        pettyCash,
        total,
        totalWithVat,
        vat,
        createPettyCost,
        activeUser.id,
        categoryBudget.id,
      );
      if (!multiAllocation) {
        throw new BadRequestException(
          'You do not have enough balance to register a petty cost.',
        );
      }
      return multiAllocation;
    }
    if (type === CostTypes.Unofficial) {
      return await this.pettyCostRepositoryImpl.create({
        ...createPettyCost,
        userId: activeUser.id,
        categoryBudgetId: categoryBudget?.id,
        status: PettyCostStatus.UNPAID,
        total,
        vat,
      });
    }
  }

  async allocateFromSingleCash(
    cash: any,
    total: number,
    totalWithVat: number,
    vat: number,
    createDto: CreatePettyCostDto,
    userId: string,
    categoryBudgetId: string,
  ) {
    const pettyCost = await this.pettyCostRepositoryImpl.create({
      ...createDto,
      pettyCashInfo: [
        {
          pettyCashId: cash.id,
          amount: totalWithVat,
        },
      ],
      userId,
      categoryBudgetId,
      total,
      vat,
    });

    await this.pettyCashService.updateOne(
      { _id: cash.id },
      { remain: cash.remain - totalWithVat },
    );

    return pettyCost;
  }

  async allocateFromMultipleCash(
    pettyCash: any[],
    total: number,
    totalWithVat: number,
    vat: number,
    createDto: CreatePettyCostDto,
    userId: string,
    categoryBudgetId: string,
  ) {
    let cumulativeTotal = 0;
    let previousTotal = 0;
    const usedCashes = [];

    for (let i = 0; i < pettyCash.length; i++) {
      cumulativeTotal += pettyCash[i].remain;
      if (cumulativeTotal >= totalWithVat) {
        const remainingAmount = totalWithVat - previousTotal;
        usedCashes.push({
          pettyCashId: pettyCash[i].id,
          amount: remainingAmount,
        });
        const pettyCost = await this.pettyCostRepositoryImpl.create({
          ...createDto,
          pettyCashInfo: usedCashes,
          userId,
          categoryBudgetId,
          total,
          vat,
        });

        const allButLast = usedCashes.slice(0, -1);
        const lastId = usedCashes[usedCashes.length - 1];

        for (const cash of allButLast) {
          await this.pettyCashService.updateMany(
            { _id: cash.pettyCashId },
            { remain: 0 },
          );
        }

        await this.pettyCashService.updateOne(
          { _id: lastId.pettyCashId },
          { remain: pettyCash[i].remain - remainingAmount },
        );

        return pettyCost;
      }
      usedCashes.push({
        pettyCashId: pettyCash[i].id,
        amount: pettyCash[i].remain,
      });

      previousTotal = cumulativeTotal;
    }

    return null;
  }

  async updateUnofficialPettyCost(
    costId: string,
    updateDto: UpdateUnofficialPettyCostDto,
  ) {
    const pettyCost = await this.pettyCostRepositoryImpl.findById(costId);

    if (!pettyCost) {
      throw new BadRequestException('petty cost not found!');
    }
    if (pettyCost.type === CostTypes.Official) {
      throw new BadRequestException('you cannot edit official cost');
    }
    const totalWithVat: number = pettyCost.amount * updateDto.currencyRate;
    const total =
      pettyCost.vat === 0 ? totalWithVat : Math.trunc((totalWithVat * 10) / 11);
    const vat = pettyCost.vat === 0 ? 0 : totalWithVat - total;

    const updateData = {
      ...updateDto,
      ...(updateDto.currencyRate && {
        total,
        vat,
      }),
    };
    let updatedPettyCost = await this.pettyCostRepositoryImpl.findOneAndUpdate(
      { _id: costId },
      updateData,
    );

    if (updatedPettyCost.categoryId && updatedPettyCost.spentDate) {
      const categoryBudget =
        await this.categoryBudgetService.validateCategoryBudget(
          updatedPettyCost.categoryId.toString(),
          updatedPettyCost.spentDate,
        );
      return this.pettyCostRepositoryImpl.findOneAndUpdate(
        { _id: costId },
        { categoryBudgetId: categoryBudget.id },
      );
    }

    return updatedPettyCost;
  }

  async updateCostsStatus(updateDto: UpdatePettyCostStatusDto) {
    const costs = await this.pettyCostRepositoryImpl.findWithOutPagination({
      _id: updateDto.costIds,
    });
    if (updateDto.status === PettyCostStatus.PAID) {
      for (const cost of costs) {
        if (cost.type === CostTypes.Unofficial && !cost.categoryBudgetId) {
          throw new BadRequestException(
            'Category budget not found. Please ensure that all costs have both a categoryId and a spentDate.',
          );
        }
      }
    }

    return this.pettyCostRepositoryImpl.updateMany(
      { _id: updateDto.costIds },
      { status: updateDto.status },
    );
  }

  async deletePettyCost(costId: string, activeUser: ActiveUserData) {
    const pettyCost = await this.pettyCostRepositoryImpl.findOne({
      _id: costId,
    });
    if (pettyCost?.status !== PettyCostStatus.UNPAID) {
      throw new BadRequestException(
        'you are not allowed to delete paid or pending cost',
      );
    }
    if (
      !activeUser.groups.includes('ceo') &&
      !activeUser.groups.includes('system-admin') &&
      !activeUser.groups.includes('financial-expert') &&
      pettyCost?.userId.toString() != activeUser.id
    ) {
      throw new BadRequestException('you are not allowed to delete this cost');
    }

    const deletedCost = await this.pettyCostRepositoryImpl.deleteById(costId);

    //return cash to user
    for (const cash of pettyCost.pettyCashInfo) {
      const pettyCash = await this.pettyCashService.findOne({
        _id: cash.pettyCashId,
      });
      if (pettyCash) {
        await this.pettyCashService.updateOne(
          { _id: cash.pettyCashId },
          { remain: pettyCash.remain + cash.amount },
        );
      }
    }

    return deletedCost;
  }

  async updateSpentDate(updateDto: UpdateUnofficialPettyCostDateDto) {
    const { spentDate, costIds } = updateDto;
    const updatedPettyCosts = await this.pettyCostRepositoryImpl.updateMany(
      { _id: { $in: costIds } },
      { $set: { spentDate } },
    );

    const updatedCost =
      await this.pettyCostRepositoryImpl.findWithOutPagination({
        _id: { $in: costIds },
      });
    for (const e of updatedCost) {
      if (e.categoryId && e.spentDate) {
        const categoryBudget =
          await this.categoryBudgetService.validateCategoryBudget(
            e.categoryId.toString(),
            e.spentDate,
          );
        return this.pettyCostRepositoryImpl.updateMany(
          { _id: { $in: costIds } },
          { $set: { categoryBudgetId: categoryBudget.id } },
        );
      }
    }
    return updatedPettyCosts;
  }

  async deleteUnofficialCost(deleteCostDto: DeleteUnofficialCostDto) {
    const costs = await this.pettyCostRepositoryImpl.findWithOutPagination({
      _id: { $in: deleteCostDto.costIds },
    });

    const hasOfficialCost = costs.some(
      (cost) => cost.type !== CostTypes.Unofficial,
    );
    if (hasOfficialCost) {
      throw new BadRequestException(
        'You are not allowed to delete official costs.',
      );
    }
    const paidCost = costs.some((cost) => cost.status === PettyCostStatus.PAID);
    if (paidCost) {
      throw new BadRequestException(
        'You are not allowed to delete paid costs.',
      );
    }
    return await this.pettyCostRepositoryImpl.deleteMany({
      _id: { $in: deleteCostDto.costIds },
    });
  }
}
