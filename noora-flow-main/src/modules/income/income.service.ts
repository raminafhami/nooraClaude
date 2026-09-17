import {
  ForbiddenException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { IncomeDocument } from './schemas/income.schema';
import { IncomeRepository } from './repository/income.repository';
import { CreateIncomeDto } from './dto/create-income.dto';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ClientSession, Types, UpdateWriteOpResult } from 'mongoose';
import { InspectionCostsService } from '../inspection-costs/inspection-costs.service';
import { ProcessInstanceDocument } from '../process-instances/schemas/process-instances.schema';
import {
  CategoryKeys,
  currencies,
  CurrencyKeys,
  IncomeStatuses,
  IncomeTypes,
  InstanceCaseTypes,
  InvoicePaymentStatuses,
  InvoiceStatuses,
  UnitMeasure,
  CurrencyKeysTransferRate,
} from 'src/common/const/enums';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { UpdateProcessInstanceDto } from '../process-instances/dtos';
import {
  daysBetweenDates,
  extractDistinctValues,
  today,
} from 'src/common/utils/data.util';
import { CurrencyRateService } from 'src/common/providers/external/currency-rate/currency-rate.service';
import { ChangeCaseTypeDto } from './dto/change-case-type.dto';
import { InvoiceService } from '../invoice/invoice.service';
import CustomError from 'src/common/providers/custom-error';
import { CategoryService } from '../categories/category.service';
import { CategoryDocument } from '../categories/entity/category.schema';
import {
  InspectionCostMethod,
  InspectionCostPeriod,
  InspectionCostType,
} from '../inspection-costs/schemas/inspection-cost.schema';
import { addDays, getCurrentUtcDate } from 'src/common/providers/moment-date';
import { ForceUpdateIncomeDto } from './dto/force-update-income.dto';

@Injectable()
export class IncomeService extends CrudService<IncomeDocument> {
  constructor(
    private readonly incomeRepository: IncomeRepository,
    @Inject(forwardRef(() => ProcessInstanceService))
    private readonly processInstanceService: ProcessInstanceService,
    private readonly inspectionCostService: InspectionCostsService,
    private readonly currencyRateService: CurrencyRateService,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly categoryService: CategoryService,
  ) {
    super(incomeRepository);
  }

  async createIncome(
    createIncomeDto: CreateIncomeDto,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<IncomeDocument> {
    try {
      const { amount, currencyRate, instanceId, type, quantity, hasTax } =
        createIncomeDto;
      let total: number = 0;
      let instance: ProcessInstanceDocument;
      if (instanceId) {
        instance = await this.processInstanceService.findOne(instanceId, [
          'InspectionFeeInRial',
          'CaseType',
        ]);

        if (!instance) {
          throw new NotFoundException('Instance not found.');
        }
      }
      //Calculate total income
      let tax = 0,
        fileTax = 0;
      total = Math.trunc(
        this.calculateTotalIncome(amount, currencyRate, quantity),
      );

      if (
        instance?.parameters?.CaseType === InstanceCaseTypes.Official ||
        hasTax
      ) {
        tax = Math.trunc(total * 0.1);
      }

      //Step 1: Create current income
      let income = await this.incomeRepository.create(
        {
          ...createIncomeDto,
          total,
          tax,
          caseNo: instance?.caseNo,
          caseStatus: instance?.status,
          createdBy: activeUser.id,
          updatedBy: activeUser.id,
          type: instanceId ? IncomeTypes.Instance : type,
        },
        session,
      );

      if (instanceId) {
        const incomes = await this.incomeRepository.findWithOutPagination({
          instanceId,
          isDeleted: false,
        });
        if (!Array.isArray(income)) {
          income = [income];
        }
        incomes.push(...income);

        //Step 2: Send all incomes for instance to calculate total inspection fee
        // await this.processInstanceService.updateInspectionFee(
        //   instance._id,
        //   incomes,
        //   session,
        // );

        let inspectionFeeInRial =
          await this.processInstanceService.calculateInspectionFeeInRial(
            instanceId,
          );

        // instance.parameters.InspectionFeeInRial = instance.parameters
        //   .InspectionFeeInRial
        //   ? instance.parameters.InspectionFeeInRial
        //   : 0;
        let feeAmount = income[0].total + inspectionFeeInRial;
        if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
          fileTax = Math.trunc(feeAmount * 0.1);
        }
        let invoicePaymentStatus = InvoicePaymentStatuses.PARTIALLY_PAID;
        if (
          !instance.parameters.InvoicePaymentStatus ||
          instance.parameters.InvoicePaymentStatus ===
            InvoicePaymentStatuses.UNPAID
        ) {
          invoicePaymentStatus = InvoicePaymentStatuses.UNPAID;
        }

        await this.processInstanceService.updateInstances(
          instance._id,
          {
            parameters: {
              InvoicePaymentStatus: invoicePaymentStatus,
              InspectionFeeInRial: feeAmount.toString(),
              InvoiceTotal: (feeAmount + fileTax).toString(),
            },
          },
          { cascade: 'false' },
          session,
        );

        //Step 3: Calculate costs again with the new inspection fee
        await this.inspectionCostService.updateCosts(
          instance._id,
          [],
          feeAmount,
          session,
        );
      }

      return income;
    } catch (error) {
      throw error;
    }
  }

  calculateTotalIncome(
    amount: number,
    rate: number,
    quantity: number = 1,
    additionalFee: number = 0,
    discount: number = 0,
  ): number {
    return (amount + additionalFee - discount) * rate * quantity;
  }

  async updateIncome(
    incomeId: string,
    updateIncomeDto: UpdateIncomeDto,
    session?: ClientSession,
  ): Promise<any> {
    const currentIncome: IncomeDocument = await this.incomeRepository.findById(
      incomeId,
    );

    const now = new Date();

    if (now.getTime() <= currentIncome.lock) {
      throw new ForbiddenException('income is progressing');
    }
    const { currencyRate, quantity, amount } = updateIncomeDto;

    let total = 0,
      tax = 0,
      fileTax = 0;

    const overdueCategory = await this.categoryService.findOne({
      key: CategoryKeys.Overdue,
    });

    if (
      currentIncome.categoryId.toString() === overdueCategory._id.toString()
    ) {
      if (
        !['system-admin', 'financial-expert', 'ceo', 'finance'].some((role) =>
          updateIncomeDto.activeUser.groups.includes(role),
        )
      ) {
        throw new ForbiddenException(
          'You are not allowed to modify overdue incomes',
        );
      }
    }

    //If income status is not unpaid so it is one a processing invoice
    if (currentIncome.status !== IncomeStatuses.Unpaid) {
      throw new ForbiddenException('You cannot update this income');
    }

    //Calculate total income
    total = this.calculateTotalIncome(
      amount || amount == 0 ? amount : currentIncome.amount,
      currencyRate ? currencyRate : currentIncome.currencyRate,
      quantity ? quantity : currentIncome.quantity,
    );

    let instance: ProcessInstanceDocument;
    if (currentIncome.instanceId) {
      instance = await this.processInstanceService.findOne(
        currentIncome.instanceId.toString(),
        ['InspectionFeeInRial', 'CaseType'],
      );

      if (!instance) {
        throw new NotFoundException('Instance not found.');
      }
      total = Math.trunc(total);

      if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
        tax = Math.trunc(total * 0.1);
      }
    }

    const updatedIncome = await this.incomeRepository.findByIdAndUpdate(
      incomeId,
      {
        ...updateIncomeDto,
        total,
        tax,
        updatedBy: updateIncomeDto.activeUser.id,
      },
      session,
    );

    if (currentIncome.instanceId) {
      const incomes = await this.incomeRepository.findWithOutPagination({
        instanceId: currentIncome.instanceId,
        _id: { $ne: incomeId },
        isDeleted: false,
      });

      const feeAmount = Math.trunc(
        parseFloat(instance.parameters.InspectionFeeInRial) -
          currentIncome.total +
          total,
      );

      if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
        fileTax = Math.trunc(0.1 * feeAmount);
      }

      await this.processInstanceService.updateInstances(
        instance._id,
        {
          parameters: {
            InspectionFeeInRial: feeAmount.toString(),
            InvoiceTotal: (feeAmount + fileTax).toString(),
          },
        },
        { cascade: 'false' },
        session,
      );

      await this.inspectionCostService.updateCosts(
        instance._id,
        [],
        feeAmount,
        session,
      );
    }
    return updatedIncome;
  }

  async remove(
    incomeId: string,
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<UpdateWriteOpResult> {
    const income: IncomeDocument = await this.incomeRepository.findById(
      incomeId,
    );

    if (!income) {
      throw new NotFoundException('Income not found');
    }

    if (income.status === IncomeStatuses.Canceled) {
      return;
    }

    const now = new Date();

    if (now.getTime() <= income.lock) {
      throw new ForbiddenException('income is progressing');
    }
    if (income?.status !== IncomeStatuses.Unpaid) {
      throw new ForbiddenException('You cannot delete a processing income');
    }

    const overdueCategory = await this.categoryService.findOne({
      key: CategoryKeys.Overdue,
    });

    if (income.categoryId.toString() === overdueCategory._id.toString()) {
      if (
        !['system-admin', 'financial-expert', 'ceo', 'finance'].some((role) =>
          activeUser.groups.includes(role),
        )
      ) {
        throw new ForbiddenException(
          'You are not allowed to delete overdue incomes',
        );
      }
    }

    //Other incomes
    const otherIncomes = await this.incomeRepository.findWithOutPagination({
      instanceId: income.instanceId,
      isDeleted: false,
      status: { $ne: IncomeStatuses.Canceled },
      _id: { $ne: incomeId },
    });

    let otherIncomesTotalFee = otherIncomes.reduce(
      (acc, cur) => acc + cur.total,
      0,
    );

    const distinctOtherIncomeStatuses = extractDistinctValues(
      otherIncomes,
      'status',
    );

    const instance = await this.processInstanceService.findOnePublic(
      income.instanceId.toString(),
      ['CaseType', 'InvoicePaymentStatus'],
    );

    let invoicePaymentStatus = instance?.parameters?.InvoicePaymentStatus;

    //If other incomes are paid so instance is paid
    if (
      !distinctOtherIncomeStatuses.includes(IncomeStatuses.Pending) &&
      !distinctOtherIncomeStatuses.includes(IncomeStatuses.Unpaid)
    ) {
      invoicePaymentStatus = InvoicePaymentStatuses.PAID;
    }

    let fileTax = 0;
    if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
      fileTax = Math.trunc(otherIncomesTotalFee * 0.1);
    }

    //Subtract this income from inspectionFeeInRial
    await this.processInstanceService.updateInstances(
      income.instanceId.toString(),
      {
        parameters: {
          InspectionFeeInRial: otherIncomesTotalFee.toString(),
          InvoicePaymentStatus: invoicePaymentStatus,
          InvoiceTotal: (otherIncomesTotalFee + fileTax).toString(),
        },
      },
      { cascade: 'false' },
      session,
    );

    //Costs should be calculated according new value
    await this.inspectionCostService.updateCosts(
      income.instanceId.toString(),
      [],
      otherIncomesTotalFee,
      session,
    );

    return await this.incomeRepository.updateById(
      incomeId,
      {
        isDeleted: true,
        updatedBy: activeUser.id,
        status: IncomeStatuses.Canceled,
      },
      session,
    );
  }

  async changeCaseType(
    changeCaseTypeDto: ChangeCaseTypeDto,
    activeUser: ActiveUserData,
    session: ClientSession,
  ) {
    const { instanceId, caseType } = changeCaseTypeDto;
    const instance = await this.processInstanceService.findOnePublic(
      instanceId,
      ['CaseType', 'InspectionFeeInRial'],
    );
    if (!instance) {
      throw new NotFoundException('Instance not found ');
    }

    //Nothing has been changed :|
    if (instance?.parameters?.CaseType === caseType) {
      return;
    }

    const incomes = await this.incomeRepository.findWithOutPagination({
      instanceId,
    });

    /**!
     * checking active invoices
     */
    const activeInvoices = await this.invoiceService.findWithOutPagination({
      status: {
        $in: [
          InvoiceStatuses.Active,
          InvoiceStatuses.Issued,
          InvoiceStatuses.Paid,
          InvoiceStatuses.Pending,
          InvoiceStatuses.Partially,
        ],
      },
      items: { $elemMatch: { $in: incomes.map((income) => income._id) } },
    });
    if (activeInvoices.length > 0) {
      throw new ForbiddenException('Cancel invoices');
    }

    //#region
    /**
     * checking if incomes are in an invoice or not
     * If the the result of this section is "Yes" user is not allowed to change case type
     * Solution: all invoices have to get canceled first
     */

    const paidIncomes = incomes.filter(
      (income) =>
        income.status === IncomeStatuses.Partially ||
        income.status === IncomeStatuses.Paid,
    );
    if (paidIncomes.length > 0) {
      //Users are not allowed to change the caseType at all
      throw new ForbiddenException('Some incomes are paid');
    }

    const pendingIncomes = incomes.filter(
      (income) => income.status === IncomeStatuses.Pending,
    );

    if (pendingIncomes.length > 0) {
      const activeInvoices = await this.invoiceService.findWithOutPagination({
        items: {
          $elemMatch: { $in: pendingIncomes.map((income) => income._id) },
        },
      });
      if (activeInvoices.length > 0) {
        throw new CustomError(
          HttpStatus.FORBIDDEN,
          'Cancel active invoices',
          activeInvoices.map((invoice) => invoice.invoiceNo),
        );
      }
    }
    //#endregion
    const insuranceCategory: CategoryDocument =
      await this.categoryService.findOne({
        key: CategoryKeys.Insurance,
      });

    if (caseType === InstanceCaseTypes.Official) {
      for (const income of incomes) {
        const now = new Date();

        if (now.getTime() <= income.lock) {
          throw new ForbiddenException('income is progressing');
        }

        await this.incomeRepository.updateById(
          income._id,
          {
            tax: Math.trunc(income.total * 0.1),
          },
          session,
        );
      }
      //Add insurance to costs
      await this.inspectionCostService.create({
        caseId: instance._id,
        caseNo: instance.caseNo,
        title: insuranceCategory.title,
        type: InspectionCostType.PERCENTAGE,
        method: InspectionCostMethod.TOTAL,
        amount: 16.67,
        period: InspectionCostPeriod.ANY,
        currency: currencies.Rial,
        currencyRate: 1,
        categoryId: insuranceCategory._id,
        total: Math.trunc(16.67 * instance.parameters.InspectionFeeInRial),
      });
    } else {
      await this.incomeRepository.updateMany(
        {
          _id: { $in: incomes.map((income) => income._id) },
        },
        { tax: 0 },
        session,
      );

      //Delete insurance from costs
      await this.inspectionCostService.deleteOne({
        caseId: instance._id,
        caseNo: instance.caseNo,
        categoryId: insuranceCategory._id,
      });
    }
    const updatedInstance = await this.processInstanceService.updateInstances(
      instanceId,
      {
        parameters: { CaseType: caseType },
      },
      { cascade: 'false' },
      session,
    );
    await this.inspectionCostService.updateCosts(instance._id);

    return updatedInstance;
  }

  async addOverdueCharge(
    incomesIds: string[],
    activeUser: ActiveUserData,
    session?: ClientSession,
  ): Promise<void> {
    const overdueIncomes = await this.incomeRepository.findWithOutPagination({
      _id: { $in: incomesIds },
    });

    const overdueCategory: CategoryDocument =
      await this.categoryService.findOne({
        key: CategoryKeys.Overdue,
      });

    const dollarRate = (
      await this.currencyRateService.getOne(
        CurrencyKeysTransferRate.PersonalDollar,
        'getTransferRates',
      )
    )['price'];

    const euroRate = (
      await this.currencyRateService.getOne(
        CurrencyKeysTransferRate.Euro,
        'getTransferRates',
      )
    ).price;

    const yuanRate = (
      await this.currencyRateService.getOne(
        CurrencyKeys.Chinese_yuan,
        'getLatestPrices',
      )
    ).price;

    for (let income of overdueIncomes) {
      const referenceIncome = await this.incomeRepository.findOne({
        refIncomeId: income._id,
      });
      const overdueInvoice = await this.invoiceService.findOne({
        items: { $elemMatch: { $eq: income._id } },
        status: {
          $in: [
            InvoiceStatuses.Active,
            InvoiceStatuses.Expired,
            InvoiceStatuses.Issued,
            InvoiceStatuses.Pending,
          ],
        },
      });

      switch (income.currency) {
        case currencies.Rial: {
          const overdueDays = daysBetweenDates(
            overdueInvoice['expiryAt'],
            new Date(getCurrentUtcDate()),
          );

          let amountInRial = Math.trunc(0.003 * income.total);

          if (referenceIncome) {
            if (referenceIncome?.status === IncomeStatuses.Unpaid) {
              await this.updateIncome(
                referenceIncome._id,
                {
                  amount: amountInRial,
                  additionalFee: referenceIncome.additionalFee,
                  categoryId: referenceIncome.categoryId.toString(),
                  currency: referenceIncome.currency,
                  currencyRate: 1,
                  description: referenceIncome.description,
                  discount: referenceIncome.discount,
                  quantity: overdueDays,
                  title: referenceIncome.title,
                  activeUser,
                },
                session,
              );
            }
          } else {
            await this.createIncome(
              {
                title: `${overdueCategory.title} - ${income?.title || ''}`,
                description: `${overdueCategory.title} - ${
                  income.caseNo || ''
                }`,
                instanceId: income?.instanceId?.toString(),
                caseNo: income.caseNo,
                costId: income?.costId?.toString(),
                quantity: overdueDays,
                unit: UnitMeasure.days,
                currency: currencies.Rial,
                amount: amountInRial,
                categoryId: overdueCategory._id,
                status: IncomeStatuses.Unpaid,
                currencyRate: 1,
                createdBy: '64fc34ccac4d2e3326f95a5c',
                type: income.type,
                duty: 0,
                additionalFee: 0,
                discount: 0,
                refIncomeId: income._id,
              },
              activeUser,
              session,
            );
          }
          break;
        }
        case currencies.Dollar: {
          if (dollarRate <= income.currencyRate) {
            continue;
          }
          let amountInDollar = Math.trunc(
            ((dollarRate - income.currencyRate) * income.amount) / dollarRate,
          );

          if (referenceIncome) {
            if (referenceIncome.status === IncomeStatuses.Unpaid) {
              await this.updateIncome(
                referenceIncome._id,
                {
                  amount: amountInDollar,
                  additionalFee: referenceIncome.additionalFee,
                  categoryId: referenceIncome.categoryId.toString(),
                  currency: referenceIncome.currency,
                  currencyRate: dollarRate,
                  description: referenceIncome.description,
                  discount: referenceIncome.discount,
                  quantity: referenceIncome.quantity,
                  title: referenceIncome.title,
                  activeUser,
                },
                session,
              );
            }
          } else {
            if (parseInt(dollarRate) > income.currencyRate) {
              await this.createIncome(
                {
                  title: `${overdueCategory.title} - ${income.title}`,
                  description: `${overdueCategory.title} - ${income.caseNo}`,
                  instanceId: income?.instanceId?.toString(),
                  caseNo: income.caseNo,
                  costId: income?.costId?.toString(),
                  quantity: 1,
                  unit: UnitMeasure.Pieces,
                  currency: currencies.Dollar,
                  amount: amountInDollar,
                  categoryId: overdueCategory._id,
                  status: IncomeStatuses.Unpaid,
                  currencyRate: dollarRate,
                  createdBy: '64fc34ccac4d2e3326f95a5c',
                  type: income.type,
                  duty: 0,
                  additionalFee: 0,
                  discount: 0,
                  refIncomeId: income._id,
                },
                activeUser,
                session,
              );
            }
          }
          break;
        }
        case currencies.Euro: {
           if (euroRate <= income.currencyRate) {
             continue;
           }
          let amountInEuro = Math.trunc(
            ((euroRate - income.currencyRate) * income.amount) / euroRate,
          );

          if (referenceIncome) {
            if (referenceIncome.status === IncomeStatuses.Unpaid) {
              await this.updateIncome(
                referenceIncome._id,
                {
                  amount: amountInEuro,
                  additionalFee: referenceIncome.additionalFee,
                  categoryId: referenceIncome.categoryId.toString(),
                  currency: referenceIncome.currency,
                  currencyRate: euroRate,
                  description: referenceIncome.description,
                  discount: referenceIncome.discount,
                  quantity: referenceIncome.quantity,
                  title: referenceIncome.title,
                  activeUser,
                },
                session,
              );
            }
          } else {
            if (parseInt(euroRate) > income.currencyRate) {
              await this.createIncome(
                {
                  title: `${overdueCategory.title} - ${income.title}`,
                  description: `${overdueCategory.title} - ${income.caseNo}`,
                  instanceId: income?.instanceId?.toString(),
                  caseNo: income.caseNo,
                  costId: income?.costId?.toString(),
                  quantity: 1,
                  unit: UnitMeasure.Pieces,
                  currency: currencies.Euro,
                  amount: amountInEuro,
                  categoryId: overdueCategory._id,
                  status: IncomeStatuses.Unpaid,
                  currencyRate: euroRate,
                  createdBy: '64fc34ccac4d2e3326f95a5c',
                  type: income.type,
                  duty: 0,
                  additionalFee: 0,
                  discount: 0,
                  refIncomeId: income._id,
                },
                activeUser,
                session,
              );
            }
          }
          break;
        }
        case currencies.Yuan: {
           if (yuanRate <= income.currencyRate) {
             continue;
           }
          let amountInYuan = Math.trunc(
            ((yuanRate - income.currencyRate) * income.amount) / yuanRate,
          );

          if (referenceIncome) {
            if (referenceIncome.status === IncomeStatuses.Unpaid) {
              await this.updateIncome(
                referenceIncome._id,
                {
                  amount: amountInYuan,
                  additionalFee: referenceIncome.additionalFee,
                  categoryId: referenceIncome.categoryId.toString(),
                  currency: referenceIncome.currency,
                  currencyRate: yuanRate,
                  description: referenceIncome.description,
                  discount: referenceIncome.discount,
                  quantity: referenceIncome.quantity,
                  title: referenceIncome.title,
                  activeUser,
                },
                session,
              );
            }
          } else {
            if (parseInt(yuanRate) > income.currencyRate) {
              await this.createIncome(
                {
                  title: `${overdueCategory.title} - ${income.title}`,
                  description: `${overdueCategory.title} - ${income.caseNo}`,
                  instanceId: income?.instanceId?.toString(),
                  caseNo: income.caseNo,
                  costId: income?.costId?.toString(),
                  quantity: 1,
                  unit: UnitMeasure.Pieces,
                  currency: currencies.Euro,
                  amount: amountInYuan,
                  categoryId: overdueCategory._id,
                  status: IncomeStatuses.Unpaid,
                  currencyRate: yuanRate,
                  createdBy: '64fc34ccac4d2e3326f95a5c',
                  type: income.type,
                  duty: 0,
                  additionalFee: 0,
                  discount: 0,
                  refIncomeId: income._id,
                },
                activeUser,
                session,
              );
            }
          }
          break;
        }
      }
    }
  }

  async getUnpaidAmount(instanceId): Promise<string> {
    const amount = await this.incomeRepository.aggregate([
      {
        $match: {
          instanceId: new Types.ObjectId(instanceId),
          status: { $in: ['unpaid', 'pending'] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
        },
      },
      {
        $project: {
          _id: 0,
          grandTotal: { $sum: ['$totalAmount', '$totalTax'] },
        },
      },
    ]);
    return amount[0]?.grandTotal ? amount[0]?.grandTotal?.toString() : '0';
  }

  async forceUpdate(
    incomeId: string,
    forceUpdateIncomeDto: ForceUpdateIncomeDto,
    session?: ClientSession,
  ) {
    const currentIncome: IncomeDocument = await this.incomeRepository.findById(
      incomeId,
    );

    const now = new Date();

    if (now.getTime() <= currentIncome.lock) {
      throw new ForbiddenException('income is progressing');
    }

    const { currencyRate, quantity, amount } = forceUpdateIncomeDto;

    let total = 0,
      tax = 0,
      fileTax = 0;

    //Calculate total income
    total = this.calculateTotalIncome(
      amount || amount == 0 ? amount : currentIncome.amount,
      currencyRate ? currencyRate : currentIncome.currencyRate,
      quantity ? quantity : currentIncome.quantity,
    );

    let instance: ProcessInstanceDocument;
    if (currentIncome.instanceId) {
      instance = await this.processInstanceService.findOne(
        currentIncome.instanceId.toString(),
        ['InspectionFeeInRial', 'CaseType'],
      );

      if (!instance) {
        throw new NotFoundException('Instance not found.');
      }
      total = Math.trunc(total);

      if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
        tax = Math.trunc(total * 0.1);
      }
    }

    const updatedIncome = await this.incomeRepository.findByIdAndUpdate(
      incomeId,
      { ...forceUpdateIncomeDto, total, tax },
      session,
    );

    if (currentIncome.instanceId) {
      const incomes = await this.incomeRepository.findWithOutPagination({
        instanceId: currentIncome.instanceId,
        _id: { $ne: incomeId },
        status: { $ne: IncomeStatuses.Canceled },
        isDeleted: false,
      });

      let totalIncomes = incomes.reduce((acc, cur) => acc + cur.total, total);

      const feeAmount = Math.trunc(totalIncomes);

      if (instance?.parameters?.CaseType === InstanceCaseTypes.Official) {
        fileTax = Math.trunc(0.1 * feeAmount);
      }

      await this.processInstanceService.updateInstances(
        instance._id,
        {
          parameters: {
            InspectionFeeInRial: feeAmount.toString(),
            InvoiceTotal: (feeAmount + fileTax).toString(),
          },
        },
        { cascade: 'false' },
        session,
      );

      await this.inspectionCostService.updateCosts(
        instance._id,
        [],
        feeAmount,
        session,
      );
    }
    return updatedIncome;
  }
}
