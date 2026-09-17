import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import {
  InspectionCostDocument,
  InspectionCostMethod,
  InspectionCostStatus,
  InspectionCostType,
} from './schemas/inspection-cost.schema';
import { InspectionCostRepositoryImpl } from './repository/inspection-cost.repository';
import e from 'express';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { extractDistinctValues } from 'src/common/utils/data.util';
import { UpdateInspectionCostsDto } from './dto/update-inspection-costs.dto';
import { GetQueryDto } from '../process-instances/dtos';
import { ClientSession } from 'mongoose';
import { CategoryService } from '../categories/category.service';
import {
  CategoryKeys,
  currencies,
  CurrencyKeys,
  IncomeStatuses,
  InspectionCostStatuses,
} from 'src/common/const/enums';
import { CurrencyRateService } from 'src/common/providers/external/currency-rate/currency-rate.service';
import { IncomeService } from '../income/income.service';

@Injectable()
export class InspectionCostsService extends CrudService<InspectionCostDocument> {
  constructor(
    private inspectionCostsRepositoryImpl: InspectionCostRepositoryImpl,
    @Inject(forwardRef(() => ProcessInstanceService))
    private readonly processInstanceService: ProcessInstanceService,
    private readonly currencyRateService: CurrencyRateService,
    @Inject(forwardRef(() => IncomeService))
    private readonly incomeService: IncomeService,
    private readonly categoryService: CategoryService,
  ) {
    super(inspectionCostsRepositoryImpl);
  }

  async bulkUpdate(data: any, session?: ClientSession) {
    const result = await this.inspectionCostsRepositoryImpl.bulkUpdate(data);
    return result;
  }

  async bulkUpdatePaymentVoucher(data: any) {
    const result =
      await this.inspectionCostsRepositoryImpl.bulkUpdatePaymentVoucher(data);
    return result;
  }

  async updateCosts(
    caseId: string,
    inspectionCostsIds: string[] = [],
    feeAmount?: number,
    session?: ClientSession,
  ): Promise<InspectionCostDocument[]> {
    const costs = await this.calculateTotalCosts(
      caseId,
      inspectionCostsIds,
      feeAmount,
    );
    await this.inspectionCostsRepositoryImpl.bulkUpdate(costs, session);
    return costs;
  }

  private async calculateTotalCosts(
    caseId: string,
    inspectionCostIds: string[] = [],
    feeAmount?: number,
  ): Promise<InspectionCostDocument[]> {
    const processInstance = await this.processInstanceService.findOne(caseId, [
      'InspectionFeeInRial',
    ]);

    const costs: InspectionCostDocument[] =
      await this.inspectionCostsRepositoryImpl.findWithOutPagination({
        caseId,
      });

    if (!feeAmount && feeAmount != 0) {
      feeAmount = processInstance.parameters.InspectionFeeInRial;
    }

    let remainingCost = feeAmount;
    for (const cost of costs) {
      let total = 0;
      if (cost.amount && cost.method === InspectionCostMethod.TOTAL) {
        if (
          cost.status !== InspectionCostStatus.UNPAID &&
          !inspectionCostIds.includes(cost._id.toString())
        ) {
          total = parseFloat(cost.total);
        } else {
          if (cost.type === InspectionCostType.FIXED) {
            total = parseFloat(cost.amount) * cost.currencyRate;
          } else {
            total = Math.floor((parseFloat(cost.amount) * feeAmount) / 100);
            const role = await this.categoryService.findOne({
              _id: cost.categoryId,
            });

            total = this.getAmountBaseOnRole(role?.key, total);
          }
        }
        cost.total = total.toString();
      }
      remainingCost -= total;
    }

    const remainingCosts: InspectionCostDocument[] = costs.filter(
      (cost) => cost.method === InspectionCostMethod.REMAINING,
    );

    let remainingCostTotal = 0;
    for (const rCost of remainingCosts) {
      if (rCost.amount) {
        if (
          rCost.status !== InspectionCostStatus.UNPAID &&
          !inspectionCostIds.includes(rCost._id.toString())
        ) {
          remainingCostTotal += parseFloat(rCost.total);
        } else {
          if (rCost.type === InspectionCostType.FIXED) {
            remainingCostTotal += parseFloat(rCost.amount) * rCost.currencyRate;
          } else {
            // remainingCostTotal += Math.floor(
            //   (parseFloat(rCost.amount) * remainingCost) / 100,
            // );

            let roleAmount = Math.floor(
              (parseFloat(rCost.amount) * remainingCost) / 100,
            );
            const role = await this.categoryService.findOne({
              _id: rCost.categoryId,
            });
            remainingCostTotal += this.getAmountBaseOnRole(
              role?.key,
              roleAmount,
            );
          }
        }
      }
    }

    if (remainingCostTotal <= remainingCost) {
      for (const rCost of remainingCosts) {
        if (rCost.amount) {
          if (
            rCost.status === InspectionCostStatus.UNPAID ||
            inspectionCostIds.includes(rCost._id.toString())
          ) {
            if (rCost.type === InspectionCostType.FIXED) {
              rCost.total = (
                parseFloat(rCost.amount) * rCost.currencyRate
              ).toString();
            } else {
              rCost.total = Math.floor(
                (parseFloat(rCost.amount) * remainingCost) / 100,
              ).toString();
              const role = await this.categoryService.findOne({
                _id: rCost.categoryId,
              });
              rCost.total = this.getAmountBaseOnRole(
                role?.key,
                parseFloat(rCost.total),
              ).toString();
            }
          }
        }
      }
    } else {
      for (const rCost of remainingCosts) {
        if (
          rCost.status === InspectionCostStatus.UNPAID ||
          inspectionCostIds.includes(rCost._id.toString())
        ) {
          rCost.total = '0';
        }
      }
    }
    return costs;
  }

  async getInspections(queryDto: GetQueryDto) {
    const populates = [];
    if (queryDto.populate) {
      if (queryDto.populate.includes('instance')) {
        populates.push(
          {
            $lookup: {
              from: 'processinstances',
              let: { caseId: '$caseId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$caseId'] },
                  },
                },
                {
                  $project: {
                    id: '$_id',
                    _id: 1,
                    name: 1,
                    status: 1,
                    buyer: '$parameters.Buyer',
                    invoicePaymentStatus: '$parameters.InvoicePaymentStatus',
                    createdAt: 1,
                  },
                },
              ],
              as: 'instance',
            },
          },
          {
            $unwind: {
              path: '$instance',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (queryDto.populate.includes('categoryId')) {
        populates.push(
          {
            $lookup: {
              from: 'categories',
              let: { categoryId: '$categoryId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$categoryId'] },
                  },
                },
                {
                  $project: {
                    id: '$_id',
                    _id: 1,
                    type: 1,
                    title: 1,
                    code: 1,
                    key: 1,
                    isDeleted: 1,
                  },
                },
              ],
              as: 'categoryId',
            },
          },
          {
            $unwind: {
              path: '$categoryId',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }

      if (queryDto.populate.includes('personId')) {
        populates.push(
          {
            $lookup: {
              from: 'users',
              let: { personId: '$personId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$_id', '$$personId'] },
                  },
                },
                {
                  $project: {
                    id: '$_id',
                    _id: 1,
                    name: 1,
                    lastname: 1,
                    username: 1,
                    branchId: 1,
                  },
                },
              ],
              as: 'personId',
            },
          },
          {
            $unwind: {
              path: '$personId',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
      if (queryDto.populate.includes('ruleId')) {
        populates.push(
          {
            $lookup: {
              from: 'paymentrules',
              localField: 'ruleId',
              foreignField: '_id',
              as: 'ruleId',
            },
          },
          {
            $unwind: {
              path: '$ruleId',
              preserveNullAndEmptyArrays: true,
            },
          },
        );
      }
    }
    queryDto.populate = populates;
    const [result] = await this.aggregateByDynamicFilter(queryDto);

    result.data = result.data.map((d) => {
      d.id = d._id;
      delete d._id;
      return d;
    });
    result.count = result?.count ? result.count : 0;
    return result;
  }

  getAmountBaseOnRole(role: string, amount: number): number {
    let total: number = amount;
    switch (role) {
      case 'coordinator':
        total = Math.min(amount, 1000000);
        break;
      case 'technical-expert':
        total = Math.min(amount, 2000000);
        break;
      case 'senior-expert':
        total = Math.min(amount, 3500000);
        break;
      case 'technical-manager':
        total = Math.min(amount, 5000000);
        break;
    }
    return total;
  }

  async updateCurrencyRates(): Promise<void> {
    const inspectionCosts =
      await this.inspectionCostsRepositoryImpl.findWithOutPagination({
        currency: { $ne: currencies.Rial },
        status: InspectionCostStatus.UNPAID,
      });

    const dollarRate = (
      await this.currencyRateService.getOne(
        CurrencyKeys.TDollar,
        this.currencyRateService.getTransferRates,
      )
    )['price'];

    const euroRate = (
      await this.currencyRateService.getOne(
        CurrencyKeys.TEuro,
        this.currencyRateService.getTransferRates,
      )
    ).price;

    const yuanRate = (
      await this.currencyRateService.getOne(
        CurrencyKeys.TChinese_yuan,
        this.currencyRateService.getTransferRates,
      )
    ).price;

    const overdueCategory = await this.categoryService.findOne({
      key: CategoryKeys.Overdue,
    });
    let i = 0;
    for (let cost of inspectionCosts) {
      const incomes = await this.incomeService.findWithOutPagination({
        instanceId: cost.caseId,
        status: { $in: [IncomeStatuses.Pending, IncomeStatuses.Unpaid] },
        categoryId: { $ne: overdueCategory._id },
      });

      if (incomes.length === 0) {
        continue;
      }

      switch (cost.currency) {
        case currencies.Dollar: {
          await this.inspectionCostsRepositoryImpl.updateById(cost._id, {
            $set: {
              initialCurrencyRate: cost.initialCurrencyRate
                ? cost.initialCurrencyRate
                : cost.currencyRate,
              currencyRate: dollarRate,
            },
          });
          break;
        }
        case currencies.Euro: {
          await this.inspectionCostsRepositoryImpl.updateById(cost._id, {
            $set: {
              initialCurrencyRate: cost.initialCurrencyRate
                ? cost.initialCurrencyRate
                : cost.currencyRate,
              currencyRate: euroRate,
            },
          });
          break;
        }
        case currencies.Yuan: {
          await this.inspectionCostsRepositoryImpl.updateById(cost._id, {
            $set: {
              initialCurrencyRate: cost.initialCurrencyRate
                ? cost.initialCurrencyRate
                : cost.currencyRate,
              currencyRate: yuanRate,
            },
          });
          break;
        }
      }
      await this.updateCosts(cost.caseId);
    }
  }

  //should be deleted is temp
  async updateC() {
   const inspectionCosts =
     await this.inspectionCostsRepositoryImpl.findWithOutPagination({});
   const hasProblem = [];
   for (let i = 0; i < inspectionCosts.length; i++) {
     console.log(i);

     const paymentInstance = await this.processInstanceService.findAllInstances(
       {
         'parameters.CostsIds': {
           $elemMatch: { $eq: inspectionCosts[i]._id.toString() },
         },
         status: { $ne: 'cancelled' },
         currentState: { $ne: 'paymentOrder-cancel' },
         processDefinitionKey: 'paymentOrder',
       },
     );

     if (paymentInstance.length > 1) {
       console.log('cost', inspectionCosts[i]);

       hasProblem.push(paymentInstance);
     }
   }
   return hasProblem;
   
  }

  async deleteInspectionCostByCaseId(caseId: string): Promise<void> {
    const costs =
      await this.inspectionCostsRepositoryImpl.findWithOutPagination({
        caseId,
      });
    for (let cost of costs) {
      if (
        cost.status === InspectionCostStatuses.pending ||
        cost.status === InspectionCostStatuses.paid
      ) {
        throw new ForbiddenException('costs are processing');
      }
    }

    await this.deleteMany({
      caseId,
    });
    await this.updateCosts(caseId);
  }

  async delete(inspectionCostId: string): Promise<void> {
    const cost = await this.inspectionCostsRepositoryImpl.findOne({
      _id: inspectionCostId,
    });
    if (
      cost.status === InspectionCostStatuses.pending ||
      cost.status === InspectionCostStatuses.paid
    ) {
      throw new ForbiddenException('costs are processing');
    }
    await this.inspectionCostsRepositoryImpl.deleteById(inspectionCostId);
    await this.updateCosts(cost?.caseId);
  }

  // public async calculateTotalCostsById(
  //   updateInspectionCostsDto: UpdateInspectionCostsDto,
  // ): Promise<InspectionCostDocument[] | NotFoundException> {
  //   const { inspectionCostIds, currency, currencyRate } =
  //     updateInspectionCostsDto;
  //   await this.inspectionCostsRepositoryImpl.updateMany(
  //     {
  //       _id: { $in: inspectionCostIds },
  //     },
  //     { currency, currencyRate },
  //   );
  //   const inspectionCosts =
  //     await this.inspectionCostsRepositoryImpl.findWithOutPagination({
  //       _id: { $in: inspectionCostIds },
  //     });
  //   if (inspectionCosts.length === 0) {
  //     throw new NotFoundException('Inspection cost not found');
  //   }
  //   const distinctCaseIds = extractDistinctValues(inspectionCosts, 'caseId');

  //   for (let caseId of distinctCaseIds) {
  //     const processInstance = await this.processInstanceService.findOne(
  //       caseId,
  //       ['InspectionFee', 'InspectionFeeInRial'],
  //     );

  //     const feeAmount =
  //       processInstance.parameters.InspectionFeeInRial |
  //       processInstance.parameters.InspectionFee;

  //     const costs: InspectionCostDocument[] =
  //       await this.inspectionCostsRepositoryImpl.findWithOutPagination({
  //         caseId,
  //       });
  //     let remainingCost = feeAmount;

  //     for (let cost of costs) {
  //       let total = 0;
  //       if (cost.amount && cost.method === InspectionCostMethod.TOTAL) {
  //         if (
  //           cost.status !== InspectionCostStatus.UNPAID &&
  //           !inspectionCostIds.includes(cost._id.toString())
  //         ) {
  //           total = parseFloat(cost.total);
  //         } else {
  //           if (cost.type === InspectionCostType.FIXED) {
  //             total = parseFloat(cost.amount) * cost.currencyRate;
  //           } else {
  //             total = Math.floor((parseFloat(cost.amount) * feeAmount) / 100);
  //           }
  //         }
  //         cost.total = total.toString();
  //       }
  //       remainingCost -= total;
  //     }

  //     const remainingCosts: InspectionCostDocument[] = costs.filter(
  //       (cost) => cost.method === InspectionCostMethod.REMAINING,
  //     );

  //     let remainingCostTotal = 0;
  //     for (let rCost of remainingCosts) {
  //       if (rCost.amount) {
  //         if (
  //           rCost.status !== InspectionCostStatus.UNPAID &&
  //           !inspectionCostIds.includes(rCost._id.toString())
  //         ) {
  //           remainingCostTotal += parseFloat(rCost.total);
  //         } else {
  //           if (rCost.type === InspectionCostType.FIXED) {
  //             remainingCostTotal +=
  //               parseFloat(rCost.amount) * rCost.currencyRate;
  //           } else {
  //             remainingCostTotal += Math.floor(
  //               (parseFloat(rCost.amount) * remainingCost) / 100,
  //             );
  //           }
  //         }
  //       }
  //     }

  //     if (remainingCostTotal <= remainingCost) {
  //       for (let rCost of remainingCosts) {
  //         if (rCost.amount) {
  //           if (
  //             rCost.status === InspectionCostStatus.UNPAID ||
  //             inspectionCostIds.includes(rCost._id.toString())
  //           ) {
  //             if (rCost.type === InspectionCostType.FIXED) {
  //               rCost.total = (
  //                 parseFloat(rCost.amount) * rCost.currencyRate
  //               ).toString();
  //             } else {
  //               rCost.total = Math.floor(
  //                 (parseFloat(rCost.amount) * remainingCost) / 100,
  //               ).toString();
  //             }
  //           }
  //         }
  //       }
  //     } else {
  //       for (let rCost of remainingCosts) {
  //         if (
  //           rCost.status === InspectionCostStatus.UNPAID ||
  //           inspectionCostIds.includes(rCost._id.toString())
  //         ) {
  //           rCost.total = '0';
  //         }
  //       }
  //     }
  //     return costs;
  //   }
  // }
}
