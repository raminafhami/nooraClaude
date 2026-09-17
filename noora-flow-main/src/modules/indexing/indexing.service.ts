import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { ProcessInstanceService } from '../process-instances/process-instances.service';
import { DebtService } from '../users/services/debt.service';
import * as moment from 'moment-jalaali';
import { gregorianToJalaali } from 'src/common/providers/moment-date';
import { ProcessInstanceDocument } from '../process-instances/schemas/process-instances.schema';
import { InspectionCostsService } from '../inspection-costs/inspection-costs.service';
import { InspectionCostDocument } from '../inspection-costs/schemas/inspection-cost.schema';
import { InstanceSearchService } from '../search/services/instance-search.service';
import { instanceMapping } from '../search/mapping/instance.mapping';
import { InspectionCostMapping } from '../search/mapping/inspection-cost.mapping';
import { debtMapping } from '../search/mapping/debt.mapping';
import { denormalizedInstanceMapping } from '../search/mapping/denormalized-instance.mapping';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { UsersService } from '../users/services/users.service';
import { userMapping } from '../search/mapping/user.mapping';
import { incomeMapping } from '../search/mapping/income.mapping';
import { IncomeService } from '../income/income.service';
import { invoiceMapping } from '../search/mapping/invoice.mapping';
import { InvoiceService } from '../invoice/invoice.service';
import { TasksService } from '../tasks/tasks.service';
import { userTaskMapping } from '../search/mapping/user-tasks.interface';
moment.loadPersian({ usePersianDigits: false });

@Injectable()
export class IndexingService {
  constructor(
    private readonly processInstanceService: ProcessInstanceService,
    private readonly debtService: DebtService,
    private readonly queueService: QueueService,
    private readonly inspectionCostService: InspectionCostsService,
    private readonly instanceSearchService: InstanceSearchService,
    private readonly userService: UsersService,
    private readonly cronJobService: CronJobService,
    private readonly incomeService: IncomeService,
    private readonly invoiceService: InvoiceService,
    private readonly userTaskService: TasksService,
  ) {

    this.cronJobService.startJob(
      '59 23 * * *', //every night at 23:59
      this.allIndexingService.bind(this),
      'Asia/Tehran',
    );
  }

  batch: number = 1000;
  async indexInstances() {
    await this.instanceSearchService.remapping('instances', instanceMapping);
    let counter = await this.processInstanceService.count({}),
      page = 0;
    while (page * this.batch < counter) {
      const { data: instances } = await this.processInstanceService.findAll(
        null,
        {
          page,
          size: this.batch,
          filters: null,
          dateFilters: null,
          populate: null,
          search: null,
          sort: null,
          props:
            'InspectionFeeInRial,Branch,Assignees,InspectionMethod,Buyer,CaseType,GoodsField,InspectionFeeCurrency,InvoiceTotal,InvoicePaymentStatus,CaseInvoiceDate,ProcessType,Amount,AmountInRial,IsCanceled',
        },
      );

      for (const instance of instances) {
        const date = {
          year: moment(instance['createdAt']).locale('fa').jYear(),
          month: moment(instance['createdAt']).locale('fa').jMonth(),
          dayOfYear: moment(instance['createdAt']).locale('fa').jDayOfYear(),
          weekOfYear: moment(instance['createdAt']).locale('fa').jWeek(),
        };

        //Dirty data
        delete instance?.parameters?.Buyer?.branches;

        if (typeof instance?.parameters?.Assignees === 'string') {
          instance.parameters.Assignees = {
            customer: { id: instance?.parameters?.Assignees },
          };
        }

        await this.queueService.indexInstance({
          id: instance.id.toString(),
          caseNo: instance.caseNo,
          processDefinitionKey: instance.processDefinitionKey,
          currentState: instance.currentState,
          status: instance.status,
          date: instance['createdAt'],
          jalaliDate: new Date(instance['createdAt'])
            .toLocaleDateString('fa-IR-u-nu-latn', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '-'), // Replace '/' with '-',
          // gregorianToJalaali(
          //   new Date(instance?.createdAt).toISOString().split('T')[0],
          // ),

          parameters: {
            // list of parameters
            inspectionFeeInRial: parseFloat(
              instance?.parameters?.InspectionFeeInRial,
            ),
            branch: instance.parameters?.Branch,
            assignees: instance.parameters?.Assignees,
            inspectionMethod: instance.parameters?.InspectionMethod,
            buyer: instance.parameters?.Buyer,
            caseType: instance.parameters?.CaseType,
            goodsField: instance.parameters?.GoodsField,
            inspectionFeeCurrency: instance.parameters?.InspectionFeeCurrency,
            invoiceTotal: parseFloat(instance.parameters?.InvoiceTotal),
            invoicePaymentStatus: instance.parameters?.InvoicePaymentStatus,
            caseInvoiceDate: instance.parameters?.CaseInvoiceDate,
            processType: instance.parameters?.ProcessType,
            amount: parseFloat(instance.parameters?.Amount),
            amountInRial: parseFloat(instance.parameters?.AmountInRial),
            isCanceled: instance.parameters?.IsCancel,
          },
          maxPossibleDuration: instance.maxPossibleDuration,
          timeActivated: instance.timeActivated,
          timeCompleted: instance.timeCompleted,
          processDefinitionName: instance.processDefinitionName,
          processPerformanceStatus:
            instance?.maxPossibleDuration != null
              ? instance?.timeCompleted <= instance?.maxPossibleDuration
              : null,

          ...date,
        });
      }
      page++;
    }
    console.log(`${counter} instances founded - Starting indexing instances`);
  }

  async indexInspectionCosts(): Promise<void> {
    const inspectionCosts: InspectionCostDocument[] =
      await this.inspectionCostService.findWithOutPagination();
    console.log(
      `${inspectionCosts.length} costs founded - Starting indexing inspection costs`,
    );
    await this.instanceSearchService.remapping(
      'inspectioncosts',
      InspectionCostMapping,
    );

    inspectionCosts.forEach(async (ic) => {
      // const date = {
      //   year: moment(ic['createdAt']).locale('fa').jYear(),
      //   month: moment(ic['createdAt']).locale('fa').jMonth(),
      //   dayOfYear: moment(ic['createdAt']).locale('fa').jDayOfYear(),
      //   weekOfYear: moment(ic['createdAt']).locale('fa').jWeek(),
      // };

      await this.queueService.indexInspectionCost({
        id: ic.id,
        caseId: ic.caseId,
        caseNo: ic.caseNo,
        caseStatus: ic.caseStatus,
        currency: ic.currency,
        personId: ic.personId,
        personName: ic.personName,
        status: ic.status,
        title: ic.title,
        total: ic.total,
        amount: ic.amount,
        method: ic.method,
        type: ic.type,
        // ...date,
      });
    });
  }

  async indexDebts() {
    await this.instanceSearchService.remapping('debts', debtMapping);

    const debts = await this.debtService.getAllDebts();
    console.log(`${debts.length} founded - Starting indexing debts`);
    for (const debt of debts) {
      await this.queueService.indexDebt(debt);
    }
  }

  async indexDenormalizedInstance(): Promise<void> {
    await this.instanceSearchService.remapping(
      'denormalizedinstance',
      denormalizedInstanceMapping,
    );

    let counter = await this.processInstanceService.count({}),
      page = 0;

    while (page * this.batch < counter) {
      const { data: instances } = await this.processInstanceService.findAll(
        null,
        {
          page,
          size: this.batch,
          filters: null,
          dateFilters: null,
          populate: 'inspectionCosts debts',
          search: null,
          sort: null,
          props:
            'InspectionFeeInRial,Branch,Assignees,InspectionMethod,Buyer,CaseType,GoodsField,InspectionFeeCurrency,InvoiceTotal,InvoicePaymentStatus,CaseInvoiceDate,ProcessType,Amount,AmountInRial,IsCanceled',
        },
      );

      for (let instance of instances) {
        //Dirty data
        delete instance?.parameters?.Buyer?.branches;

        if (typeof instance?.parameters?.Assignees === 'string') {
          instance.parameters.Assignees = {
            customer: { id: instance?.parameters?.Assignees },
          };
        }

        const date = {
          year: moment(instance['createdAt']).locale('fa').jYear(),
          month: moment(instance['createdAt']).locale('fa').jMonth(),
          dayOfYear: moment(instance['createdAt']).locale('fa').jDayOfYear(),
          weekOfYear: moment(instance['createdAt']).locale('fa').jWeek(),
        };
        await this.queueService.indexDenormalizedInstance({
          id: instance.id.toString(),
          caseNo: instance.caseNo,
          processDefinitionKey: instance.processDefinitionKey,
          currentState: instance.currentState,
          status: instance.status,
          date: instance['createdAt'],
          jalaliDate: new Date(instance['createdAt'])
            .toLocaleDateString('fa-IR-u-nu-latn', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\//g, '-'), // Replace '/' with '-',
          // gregorianToJalaali(
          //   new Date(instance?.createdAt).toISOString().split('T')[0],
          // ),
          parameters: {
            // list of parameters
            inspectionFeeInRial: parseFloat(
              instance?.parameters?.InspectionFeeInRial,
            ),
            branch: instance.parameters?.Branch,
            assignees: instance.parameters?.Assignees,
            inspectionMethod: instance.parameters?.InspectionMethod,
            buyer: instance.parameters?.Buyer,
            caseType: instance.parameters?.CaseType,
            goodsField: instance.parameters?.GoodsField,
            inspectionFeeCurrency: instance.parameters?.InspectionFeeCurrency,
            invoiceTotal: parseFloat(instance.parameters?.InvoiceTotal),
            invoicePaymentStatus: instance.parameters?.InvoicePaymentStatus,
            caseInvoiceDate: instance.parameters?.CaseInvoiceDate,
            processType: instance.parameters?.ProcessType,
            amount: parseFloat(instance.parameters?.Amount),
            amountInRial: parseFloat(instance.parameters?.AmountInRial),
            isCanceled: instance.parameters?.IsCancel,
          },
          ...date,
          inspectionCosts: instance['inspectionCosts'],
          debts: instance['debts'],
        });
      }
      page++;
    }
    console.log(
      `${counter} deNormalized instances founded - Starting indexing denormalizedInstances`,
    );
  }

  async indexUsers(): Promise<void> {
    await this.instanceSearchService.remapping('users', userMapping);
    const users = await this.userService.findWithOutPagination();
    console.log(`${users.length} founded - Starting indexing users`);
    for (const user of users) {
      await this.queueService.indexUser(user);
    }
  }

  async indexIncomes(): Promise<void> {
    await this.instanceSearchService.remapping('incomes', incomeMapping);
    const incomes = await this.incomeService.findWithOutPagination();
    console.log(`${incomes.length} founded - Starting indexing incomes`);
    for (const income of incomes) {
      await this.queueService.indexIncome(income);
    }
  }

  async indexInvoices(): Promise<void> {
    await this.instanceSearchService.remapping('invoices', invoiceMapping);
    const invoices = await this.invoiceService.findWithOutPagination();
    console.log(`${invoices.length} founded - Starting indexing invoices`);
    for (const invoice of invoices) {
      await this.queueService.indexInvoice(invoice);
    }
  }

  async indexUserTasks(): Promise<void> {
    await this.instanceSearchService.remapping('usertasks', userTaskMapping);
    let counter = await this.userTaskService.count({}),
      page = 0;
    while (page * this.batch < counter) {
      const userTasks: any = await this.userTaskService.findAllTasks({
        customFilters: null,
        filters: null,
        page,
        size: this.batch,
        search: null,
        sort: null,
      });
      for (const task of userTasks.data) {
        await this.queueService.indexUserTask(task);
      }
      page++;
    }
    console.log(
      `${counter} founded - Starting indexing userTasks`,
    );
  }

  async allIndexingService() {
    await Promise.all([
      this.indexInstances(),
      this.indexInspectionCosts(),
      this.indexDebts(),
      this.indexDenormalizedInstance(),
      this.indexUsers(),
      this.indexIncomes(),
      this.indexInvoices(),
      this.indexUserTasks(),
    ]);
  }
}
